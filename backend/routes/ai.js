const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOpenAI, isOpenAIAvailable, getAVSystemPrompt, calculateTokenCost } = require('../config/openai');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const webSearchService = require('../services/webSearch');
const { getLinkPreview } = require('../services/linkPreview');

const router = express.Router();

// Start a new AI conversation
router.post('/conversation/start', async (req, res) => {
    try {
        const { sessionId } = req.body;

        // Get test user ID
        const testUserId = getTestUserId();

        // Use service client for database operations (bypasses RLS for this specific user)
        const supabaseService = getSupabaseService();

        // Create a game session first (required by foreign key constraint)
        // Use the sessionId from the frontend if it's a valid UUID, otherwise generate one
        let gameSessionId;
        try {
            // Validate if sessionId is a valid UUID
            if (sessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
                gameSessionId = sessionId;
            } else {
                gameSessionId = uuidv4();
            }
        } catch (error) {
            gameSessionId = uuidv4();
        }

        // Check if game session already exists
        let gameSession;
        const { data: existingSession, error: checkError } = await supabaseService
            .from('game_sessions')
            .select('*')
            .eq('id', gameSessionId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            logger.error('Error checking existing game session:', checkError);
            return res.status(500).json({ error: 'Failed to check game session' });
        }

        if (existingSession) {
            // Use existing session
            gameSession = existingSession;
            logger.info(`Using existing game session: ${gameSessionId}`);
        } else {
            // Create new game session
            const { data: newSession, error: sessionError } = await supabaseService
                .from('game_sessions')
                .insert({
                    id: gameSessionId,
                    user_id: testUserId,
                    session_start: new Date().toISOString(),
                    current_level: 'audio-1',
                    is_active: true
                })
                .select()
                .single();

            if (sessionError) {
                logger.error('Error creating game session:', sessionError);
                return res.status(500).json({ error: 'Failed to create game session' });
            }
            gameSession = newSession;
        }

        // Create new conversation
        const { data: conversation, error } = await supabaseService
            .from('ai_conversations')
            .insert({
                user_id: testUserId,
                session_id: gameSession.id,
                conversation_start: new Date().toISOString(),
                is_active: true
            })
            .select()
            .single();

        if (error) {
            logger.error('Error creating conversation:', error);
            return res.status(500).json({ error: 'Failed to start conversation' });
        }

        logger.info(`New AI conversation started for user ${testUserId}: ${conversation.id}`);
        res.status(201).json({
            success: true,
            conversation_id: conversation.id,
            message: 'Conversation started successfully'
        });
    } catch (error) {
        logger.error('Error starting conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to get test user ID
function getTestUserId() {
    // Return the real test user ID
    return '07a63a2d-2861-4a55-9ef7-41becba6a310';
}

// Helper function to get service client for database operations
function getSupabaseService() {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

// Send message to AI
router.post('/chat', [
    body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
    body('conversationId').notEmpty().withMessage('Conversation ID required'),
    body('equipmentContext').optional().custom((value) => {
        if (value !== null && value !== undefined && typeof value !== 'object') {
            throw new Error('Equipment context must be an object or null');
        }
        return true;
    }),
    body('needsWebSearch').optional().isBoolean().withMessage('needsWebSearch must be a boolean')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { message, conversationId, equipmentContext } = req.body;

        // Check if OpenAI is available
        if (!isOpenAIAvailable()) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'OpenAI service is currently not available'
            });
        }

        // Get test user ID
        const testUserId = getTestUserId();

        // Use service client for database operations (bypasses RLS for this specific user)
        const supabaseService = getSupabaseService();
        const openai = getOpenAI();

        // Get conversation history
        const { data: messages, error: messagesError } = await supabaseService
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            logger.error('Error fetching messages:', messagesError);
            return res.status(500).json({ error: 'Failed to fetch conversation history' });
        }

        // Prepare messages for OpenAI
        const systemPrompt = getAVSystemPrompt(equipmentContext);
        const openaiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const startTime = Date.now();

        // Call OpenAI API with GPT-4o for voice responses
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Use GPT-4o for voice responses
            messages: openaiMessages,
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        });

        const responseTime = Date.now() - startTime;
        const aiResponse = completion.choices[0].message.content;
        const tokensUsed = completion.usage.total_tokens;
        const cost = calculateTokenCost(tokensUsed);

        // Save user message
        const { error: userMessageError } = await supabaseService
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                user_id: testUserId,
                role: 'user',
                content: message,
                equipment_context: equipmentContext,
                message_type: 'text',
                created_at: new Date().toISOString()
            });

        if (userMessageError) {
            logger.error('Error saving user message:', userMessageError);
        }

        // Save AI response
        const { error: aiMessageError } = await supabaseService
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                user_id: testUserId,
                role: 'assistant',
                content: aiResponse,
                equipment_context: equipmentContext,
                message_type: 'text',
                tokens_used: tokensUsed,
                response_time: responseTime,
                created_at: new Date().toISOString()
            });

        if (aiMessageError) {
            logger.error('Error saving AI message:', aiMessageError);
        }

        // Track API usage
        const { error: usageError } = await supabaseService
            .from('api_usage')
            .insert({
                user_id: testUserId,
                api_type: 'openai_chat',
                tokens_used: tokensUsed,
                cost_usd: cost,
                request_count: 1,
                success: true,
                created_at: new Date().toISOString()
            });

        if (usageError) {
            logger.error('Error tracking API usage:', usageError);
        }

        // Update conversation message count
        await supabaseService
            .from('ai_conversations')
            .update({ total_messages: (messages?.length || 0) + 2 })
            .eq('id', conversationId);

        logger.info(`AI chat processed for user ${testUserId}, tokens: ${tokensUsed}, cost: $${cost}`);

        res.json({
            success: true,
            response: aiResponse,
            conversation_id: conversationId,
            tokens_used: tokensUsed,
            response_time: responseTime,
            cost: cost
        });

    } catch (error) {
        logger.error('Error in AI chat:', error);

        // Track failed API usage
        try {
            await supabaseService
                .from('api_usage')
                .insert({
                    user_id: testUserId,
                    api_type: 'openai_chat',
                    tokens_used: 0,
                    cost_usd: 0,
                    request_count: 1,
                    success: false,
                    error_message: error.message,
                    created_at: new Date().toISOString()
                });
        } catch (trackingError) {
            logger.error('Error tracking failed API usage:', trackingError);
        }

        res.status(500).json({
            error: 'AI service error',
            message: 'Failed to process your message. Please try again.'
        });
    }
});

// Process voice message
router.post('/voice', [
    body('audioData').isString().withMessage('Audio data required'),
    body('conversationId').isUUID().withMessage('Valid conversation ID required'),
    body('duration').isInt({ min: 1 }).withMessage('Valid duration required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { audioData, conversationId, duration } = req.body;
        const userId = req.user.id;

        if (!isOpenAIAvailable()) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'OpenAI service is currently not available'
            });
        }

        const openai = getOpenAI();
        const supabase = getSupabase();

        // Convert base64 audio to buffer
        const audioBuffer = Buffer.from(audioData, 'base64');

        // Transcribe audio using OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: audioBuffer,
            model: 'whisper-1',
            response_format: 'text'
        });

        const transcribedText = transcription.text;

        // Process the transcribed text through chat
        const systemPrompt = getAVSystemPrompt();
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: transcribedText }
            ],
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        });

        const aiResponse = completion.choices[0].message.content;
        const tokensUsed = completion.usage.total_tokens;
        const cost = calculateTokenCost(tokensUsed);

        // Save voice message
        await supabase
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                user_id: userId,
                role: 'user',
                content: transcribedText,
                message_type: 'voice',
                voice_duration: duration,
                created_at: new Date().toISOString()
            });

        // Save AI response
        await supabase
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                user_id: userId,
                role: 'assistant',
                content: aiResponse,
                message_type: 'text',
                tokens_used: tokensUsed,
                created_at: new Date().toISOString()
            });

        // Track API usage
        await supabase
            .from('api_usage')
            .insert({
                user_id: userId,
                api_type: 'openai_voice',
                tokens_used: tokensUsed,
                cost_usd: cost,
                request_count: 1,
                success: true,
                created_at: new Date().toISOString()
            });

        logger.info(`Voice message processed for user ${userId}, duration: ${duration}ms, tokens: ${tokensUsed}`);

        res.json({
            success: true,
            transcribed_text: transcribedText,
            response: aiResponse,
            tokens_used: tokensUsed,
            cost: cost
        });

    } catch (error) {
        logger.error('Error processing voice message:', error);
        res.status(500).json({
            error: 'Voice processing error',
            message: 'Failed to process voice message. Please try again.'
        });
    }
});

// Get conversation history
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const supabase = getSupabase();

        // Get conversation details
        const { data: conversation, error: convError } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .single();

        if (convError || !conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Get messages
        const { data: messages, error: msgError } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (msgError) {
            logger.error('Error fetching messages:', msgError);
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }

        res.json({
            success: true,
            conversation,
            messages
        });

    } catch (error) {
        logger.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// End conversation
router.put('/conversation/:conversationId/end', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const supabase = getSupabase();

        const { error } = await supabase
            .from('ai_conversations')
            .update({
                conversation_end: new Date().toISOString(),
                is_active: false
            })
            .eq('id', conversationId)
            .eq('user_id', userId);

        if (error) {
            logger.error('Error ending conversation:', error);
            return res.status(500).json({ error: 'Failed to end conversation' });
        }

        logger.info(`Conversation ${conversationId} ended by user ${userId}`);
        res.json({ success: true, message: 'Conversation ended successfully' });

    } catch (error) {
        logger.error('Error ending conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Web search endpoint using GPT-5
router.post('/web-search', [
    body('query').trim().isLength({ min: 1, max: 500 }).withMessage('Search query must be between 1 and 500 characters'),
    body('conversationId').notEmpty().withMessage('Conversation ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { query, conversationId } = req.body;
        const testUserId = getTestUserId();

        if (!isOpenAIAvailable()) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'OpenAI service is currently not available'
            });
        }

        const supabaseService = getSupabaseService();
        const openai = getOpenAI();

        // Use GPT-5 for web search
        const startTime = Date.now();

        // Perform real web search
        logger.info(`Performing web search for: "${query}"`);
        const webResults = await webSearchService.searchWeb(query, 5);

        // Get detailed information from top results
        const detailedResults = [];
        for (const result of webResults.slice(0, 3)) {
            try {
                const detailedInfo = await webSearchService.getDetailedInfo(result.url);
                if (detailedInfo) {
                    detailedResults.push({
                        ...result,
                        detailedInfo
                    });
                }
            } catch (error) {
                logger.error(`Error getting detailed info for ${result.url}:`, error.message);
            }
        }

        // Prepare context for AI
        const searchContext = webResults.map(result =>
            `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}\nSource: ${result.source}`
        ).join('\n\n');

        const detailedContext = detailedResults.map(result =>
            `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.detailedInfo.content.substring(0, 500)}...`
        ).join('\n\n');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Use GPT-4o with real web search results
            messages: [
                {
                    role: 'system',
                    content: `You are AVA (Audio Visual Assistant), an expert AI assistant specializing in audio-visual equipment and live event production. 

IMPORTANT: Your name is AVA and you MUST always introduce yourself as "Hello, I am AVA, your Audio Visual Assistant" when greeting users for the first time in a conversation. Never use any other name or introduction.

You have access to real-time web search results to provide current, accurate information about AV gear, pricing, specifications, and industry trends.
                    
Use the provided web search results to answer the user's question with the most up-to-date information available. Focus on:
- Current pricing and availability
- Latest product specifications and features
- Professional reviews and comparisons
- Industry trends and best practices
- Where to purchase equipment
                    
Always cite your sources when providing information from web search results. Format your responses in a clear, educational manner suitable for someone learning about AV equipment.
                    
Web Search Results:
${searchContext}
                    
Detailed Information:
${detailedContext}`
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            max_tokens: 1200,
            temperature: 0.7
        });

        const responseTime = Date.now() - startTime;
        const aiResponse = completion.choices[0].message.content;
        const tokensUsed = completion.usage.total_tokens;
        const cost = calculateTokenCost(tokensUsed);

        // Save web search to database
        const { error: searchError } = await supabaseService
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                user_id: testUserId,
                role: 'assistant',
                content: aiResponse,
                message_type: 'text', // Use existing type since web_search isn't in constraints
                tokens_used: tokensUsed,
                response_time: responseTime,
                created_at: new Date().toISOString()
            });

        if (searchError) {
            logger.error('Error saving web search:', searchError);
        }

        // Track API usage
        const { error: usageError } = await supabaseService
            .from('api_usage')
            .insert({
                user_id: testUserId,
                api_type: 'openai_chat', // Use existing type since web_search isn't in constraints
                tokens_used: tokensUsed,
                cost_usd: cost,
                request_count: 1,
                success: true,
                created_at: new Date().toISOString()
            });

        if (usageError) {
            logger.error('Error tracking web search usage:', usageError);
        }

        logger.info(`Web search completed for user ${testUserId}, query: "${query}", tokens: ${tokensUsed}, cost: $${cost}`);

        res.json({
            success: true,
            response: aiResponse,
            conversation_id: conversationId,
            tokens_used: tokensUsed,
            response_time: responseTime,
            cost: cost,
            search_query: query
        });

    } catch (error) {
        logger.error('Error in web search:', error);

        // Track failed API usage
        try {
            const supabaseService = getSupabaseService();
            await supabaseService
                .from('api_usage')
                .insert({
                    user_id: getTestUserId(),
                    api_type: 'openai_chat', // Use existing type
                    tokens_used: 0,
                    cost_usd: 0,
                    request_count: 1,
                    success: false,
                    error_message: error.message,
                    created_at: new Date().toISOString()
                });
        } catch (trackingError) {
            logger.error('Error tracking failed web search usage:', trackingError);
        }

        res.status(500).json({
            error: 'Web search error',
            message: 'Failed to perform web search. Please try again.'
        });
    }
});

// Specialized pricing search endpoint
router.post('/pricing-search', [
    body('query').trim().isLength({ min: 1, max: 500 }).withMessage('Search query must be between 1 and 500 characters'),
    body('conversationId').notEmpty().withMessage('Conversation ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { query, conversationId } = req.body;
        const testUserId = getTestUserId();

        if (!isOpenAIAvailable()) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'OpenAI service is currently not available'
            });
        }

        const supabaseService = getSupabaseService();
        const openai = getOpenAI();

        const startTime = Date.now();

        // Perform specialized pricing search
        logger.info(`Performing pricing search for: "${query}"`);
        const pricingResults = await webSearchService.searchForPricing(query);

        // Prepare context for AI
        const pricingContext = pricingResults.map(result =>
            `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}\nSource: ${result.source}`
        ).join('\n\n');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are AVA (Audio Visual Assistant), an expert AI assistant specializing in audio-visual equipment pricing. 

IMPORTANT: Your name is AVA and you MUST always introduce yourself as "Hello, I am AVA, your Audio Visual Assistant" when greeting users for the first time in a conversation. Never use any other name or introduction.

You have access to real-time web search results focused on current pricing information.
                    
Analyze the provided pricing search results and provide:
- Current price ranges for the requested equipment
- Price comparisons across different retailers
- Any available discounts or deals
- Recommendations for the best value
- Links to purchase options
                    
Always cite your sources and provide the most up-to-date pricing information available.
                    
Pricing Search Results:
${pricingContext}`
                },
                {
                    role: 'user',
                    content: `Find current pricing information for: ${query}`
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        const responseTime = Date.now() - startTime;
        const aiResponse = completion.choices[0].message.content;
        const tokensUsed = completion.usage.total_tokens;
        const cost = calculateTokenCost(tokensUsed);

        // Save to database
        const { error: searchError } = await supabaseService
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                user_id: testUserId,
                role: 'assistant',
                content: aiResponse,
                message_type: 'text',
                tokens_used: tokensUsed,
                response_time: responseTime,
                created_at: new Date().toISOString()
            });

        if (searchError) {
            logger.error('Error saving pricing search:', searchError);
        }

        // Track API usage
        const { error: usageError } = await supabaseService
            .from('api_usage')
            .insert({
                user_id: testUserId,
                api_type: 'openai_chat',
                tokens_used: tokensUsed,
                cost_usd: cost,
                request_count: 1,
                success: true,
                created_at: new Date().toISOString()
            });

        if (usageError) {
            logger.error('Error tracking pricing search usage:', usageError);
        }

        logger.info(`Pricing search completed for user ${testUserId}, query: "${query}", tokens: ${tokensUsed}, cost: $${cost}`);

        res.json({
            success: true,
            response: aiResponse,
            conversation_id: conversationId,
            tokens_used: tokensUsed,
            response_time: responseTime,
            cost: cost,
            search_query: query,
            search_type: 'pricing'
        });

    } catch (error) {
        logger.error('Error in pricing search:', error);
        res.status(500).json({
            error: 'Pricing search error',
            message: 'Failed to perform pricing search. Please try again.'
        });
    }
});

// Simple rate limiter for link preview
const linkPreviewRequests = new Map();

// Link preview endpoint
router.post('/link-preview', [
    body('url').trim().isURL().withMessage('Valid URL required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { url } = req.body;
        const clientIP = req.ip || 'unknown';
        const now = Date.now();

        // Simple rate limiting: max 20 requests per minute per IP (more generous for multiple links)
        const clientRequests = linkPreviewRequests.get(clientIP) || [];
        const recentRequests = clientRequests.filter(time => now - time < 60000); // Last minute

        if (recentRequests.length >= 20) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please wait before making more requests.'
            });
        }

        // Add current request
        recentRequests.push(now);
        linkPreviewRequests.set(clientIP, recentRequests);

        // Clean up old entries
        if (recentRequests.length > 10) {
            linkPreviewRequests.set(clientIP, recentRequests.slice(-5));
        }

        const preview = await getLinkPreview(url);
        res.json({ success: true, preview });
    } catch (error) {
        logger.error('Error generating link preview:', error);
        res.status(500).json({ error: 'Failed to generate link preview' });
    }
});

module.exports = router;
