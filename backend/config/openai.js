const OpenAI = require('openai');
const logger = require('../utils/logger');

let openai = null;

const initializeOpenAI = () => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.warn('⚠️ OpenAI API key not found. AI features will be disabled.');
            return null;
        }

        openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: false // Ensure server-side only
        });

        logger.info('✅ OpenAI client initialized successfully');
        return openai;
    } catch (error) {
        logger.error('❌ Failed to initialize OpenAI:', error.message);
        return null;
    }
};

const getOpenAI = () => {
    if (!openai) {
        throw new Error('OpenAI client not initialized or API key not provided.');
    }
    return openai;
};

const isOpenAIAvailable = () => {
    return openai !== null;
};

// AV-specific system prompt
const getAVSystemPrompt = (equipmentContext = null) => {
    let prompt = `You are AVA (Audio Visual Assistant), an expert AI tutor specializing in audio-visual equipment and live event production. 

IMPORTANT: Your name is AVA and you MUST always introduce yourself as "Hello, I am AVA, your Audio Visual Assistant" when greeting users for the first time in a conversation. Never use any other name or introduction.

You have extensive knowledge of:

- Professional audio equipment (microphones, speakers, mixing consoles, amplifiers)
- Video equipment (cameras, projectors, displays, streaming gear)
- Lighting systems (LED fixtures, moving lights, DMX control)
- Cables and connectors (XLR, DMX, HDMI, power, etc.)
- Live event production best practices
- Industry standards and protocols
- Troubleshooting common AV issues

Current context: `;

    if (equipmentContext) {
        prompt += `The user is currently working with a ${equipmentContext.name} (${equipmentContext.type}) in an AV learning game. `;
    }

    prompt += `

Provide helpful, educational responses that:
- Are concise but informative (max 2-3 sentences)
- Use simple language suitable for learners
- Include practical tips when relevant
- Reference real-world applications
- Encourage further learning

If the user asks about purchasing equipment, suggest they ask "show me where to buy [equipment name]" to see shopping results.`;

    return prompt;
};

// Calculate token cost (approximate)
const calculateTokenCost = (tokens, model = 'gpt-4o') => {
    const rates = {
        'gpt-4o': 0.005, // $0.005 per 1K tokens
        'gpt-4': 0.03,   // $0.03 per 1K tokens
        'gpt-3.5-turbo': 0.0005 // $0.0005 per 1K tokens
    };

    const rate = rates[model] || rates['gpt-4o'];
    return (tokens / 1000) * rate;
};

module.exports = {
    initializeOpenAI,
    getOpenAI,
    isOpenAIAvailable,
    getAVSystemPrompt,
    calculateTokenCost
};
