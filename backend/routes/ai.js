const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOpenAI, isOpenAIAvailable, getAVSystemPrompt, calculateTokenCost } = require('../config/openai');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Start a new AI conversation
router.post('/conversation/start', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    const supabase = getSupabase();
    
    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        session_id: sessionId,
        conversation_start: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating conversation:', error);
      return res.status(500).json({ error: 'Failed to start conversation' });
    }

    logger.info(`New AI conversation started for user ${userId}`);
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

// Send message to AI
router.post('/chat', [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('conversationId').isUUID().withMessage('Valid conversation ID required'),
  body('equipmentContext').optional().isObject()
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
    const userId = req.user.id;

    // Check if OpenAI is available
    if (!isOpenAIAvailable()) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'OpenAI service is currently not available'
      });
    }

    const supabase = getSupabase();
    const openai = getOpenAI();

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
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

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: openaiMessages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    });

    const responseTime = Date.now() - startTime;
    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    const cost = calculateTokenCost(tokensUsed);

    // Save user message
    const { error: userMessageError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
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
    const { error: aiMessageError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
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
    const { error: usageError } = await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
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
    await supabase
      .from('ai_conversations')
      .update({ total_messages: messages.length + 2 })
      .eq('id', conversationId);

    logger.info(`AI chat processed for user ${userId}, tokens: ${tokensUsed}, cost: $${cost}`);

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
      const supabase = getSupabase();
      await supabase
        .from('api_usage')
        .insert({
          user_id: req.user.id,
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

module.exports = router;
