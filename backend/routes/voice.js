const express = require('express');
const { body, validationResult } = require('express-validator');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');

const router = express.Router();

// Start voice session
router.post('/session/start', async (req, res) => {
    try {
        const userId = req.user.id;

        const supabase = getSupabase();

        // Get active game session
        const { data: gameSession, error: sessionError } = await supabase
            .from('game_sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (sessionError) {
            logger.error('Error fetching active game session:', sessionError);
            return res.status(500).json({ error: 'No active game session found' });
        }

        // End any existing voice session
        await supabase
            .from('voice_sessions')
            .update({
                session_end: new Date().toISOString(),
                is_active: false
            })
            .eq('user_id', userId)
            .eq('is_active', true);

        // Create new voice session
        const { data: voiceSession, error } = await supabase
            .from('voice_sessions')
            .insert({
                user_id: userId,
                session_id: gameSession.id,
                session_start: new Date().toISOString(),
                is_active: true
            })
            .select()
            .single();

        if (error) {
            logger.error('Error creating voice session:', error);
            return res.status(500).json({ error: 'Failed to start voice session' });
        }

        logger.info(`Voice session started for user ${userId}`);
        res.status(201).json({
            success: true,
            voice_session_id: voiceSession.id,
            message: 'Voice session started successfully'
        });

    } catch (error) {
        logger.error('Error starting voice session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update voice session
router.put('/session/:sessionId', [
    body('duration').optional().isInt({ min: 0 }),
    body('messageCount').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { sessionId } = req.params;
        const { duration, messageCount } = req.body;
        const userId = req.user.id;

        const supabase = getSupabase();

        // Verify session belongs to user
        const { data: session, error: sessionError } = await supabase
            .from('voice_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', userId)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({ error: 'Voice session not found' });
        }

        // Update session
        const updateData = {};
        if (duration !== undefined) updateData.total_duration = duration;
        if (messageCount !== undefined) updateData.voice_messages_count = messageCount;

        const { error: updateError } = await supabase
            .from('voice_sessions')
            .update(updateData)
            .eq('id', sessionId);

        if (updateError) {
            logger.error('Error updating voice session:', updateError);
            return res.status(500).json({ error: 'Failed to update voice session' });
        }

        logger.info(`Voice session ${sessionId} updated for user ${userId}`);
        res.json({
            success: true,
            message: 'Voice session updated successfully'
        });

    } catch (error) {
        logger.error('Error updating voice session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// End voice session
router.put('/session/:sessionId/end', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const supabase = getSupabase();

        const { error } = await supabase
            .from('voice_sessions')
            .update({
                session_end: new Date().toISOString(),
                is_active: false
            })
            .eq('id', sessionId)
            .eq('user_id', userId);

        if (error) {
            logger.error('Error ending voice session:', error);
            return res.status(500).json({ error: 'Failed to end voice session' });
        }

        logger.info(`Voice session ${sessionId} ended by user ${userId}`);
        res.json({
            success: true,
            message: 'Voice session ended successfully'
        });

    } catch (error) {
        logger.error('Error ending voice session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get active voice session
router.get('/session/active', async (req, res) => {
    try {
        const userId = req.user.id;

        const supabase = getSupabase();

        const { data: session, error } = await supabase
            .from('voice_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            logger.error('Error fetching active voice session:', error);
            return res.status(500).json({ error: 'Failed to fetch active voice session' });
        }

        res.json({
            success: true,
            session: session || null
        });

    } catch (error) {
        logger.error('Error fetching active voice session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get voice session history
router.get('/sessions', async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10, offset = 0 } = req.query;

        const supabase = getSupabase();

        const { data: sessions, error } = await supabase
            .from('voice_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (error) {
            logger.error('Error fetching voice sessions:', error);
            return res.status(500).json({ error: 'Failed to fetch voice sessions' });
        }

        res.json({
            success: true,
            sessions,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        logger.error('Error fetching voice sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
