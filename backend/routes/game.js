const express = require('express');
const { body, validationResult } = require('express-validator');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');

const router = express.Router();

// Start a new game session
router.post('/session/start', [
    body('levelId').optional().isString().withMessage('Valid level ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { levelId } = req.body;
        const userId = req.user.id;

        const supabase = getSupabase();

        // End any existing active session
        await supabase
            .from('game_sessions')
            .update({
                session_end: new Date().toISOString(),
                is_active: false
            })
            .eq('user_id', userId)
            .eq('is_active', true);

        // Create new session
        const { data: session, error } = await supabase
            .from('game_sessions')
            .insert({
                user_id: userId,
                session_start: new Date().toISOString(),
                current_level: levelId || 'audio-1',
                is_active: true
            })
            .select()
            .single();

        if (error) {
            logger.error('Error creating game session:', error);
            return res.status(500).json({ error: 'Failed to start game session' });
        }

        logger.info(`New game session started for user ${userId}, level: ${levelId || 'audio-1'}`);
        res.status(201).json({
            success: true,
            session_id: session.id,
            message: 'Game session started successfully'
        });

    } catch (error) {
        logger.error('Error starting game session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update game session
router.put('/session/:sessionId', [
    body('currentLevel').optional().isString(),
    body('score').optional().isInt({ min: 0 }),
    body('lives').optional().isInt({ min: 0, max: 10 }),
    body('timeSpent').optional().isInt({ min: 0 })
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
        const { currentLevel, score, lives, timeSpent } = req.body;
        const userId = req.user.id;

        const supabase = getSupabase();

        // Verify session belongs to user
        const { data: session, error: sessionError } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', userId)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({ error: 'Game session not found' });
        }

        // Update session
        const updateData = {};
        if (currentLevel) updateData.current_level = currentLevel;
        if (score !== undefined) updateData.score = score;
        if (lives !== undefined) updateData.lives = lives;
        if (timeSpent !== undefined) updateData.time_spent = timeSpent;

        const { error: updateError } = await supabase
            .from('game_sessions')
            .update(updateData)
            .eq('id', sessionId);

        if (updateError) {
            logger.error('Error updating game session:', updateError);
            return res.status(500).json({ error: 'Failed to update game session' });
        }

        logger.info(`Game session ${sessionId} updated for user ${userId}`);
        res.json({
            success: true,
            message: 'Game session updated successfully'
        });

    } catch (error) {
        logger.error('Error updating game session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// End game session
router.put('/session/:sessionId/end', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const supabase = getSupabase();

        const { error } = await supabase
            .from('game_sessions')
            .update({
                session_end: new Date().toISOString(),
                is_active: false
            })
            .eq('id', sessionId)
            .eq('user_id', userId);

        if (error) {
            logger.error('Error ending game session:', error);
            return res.status(500).json({ error: 'Failed to end game session' });
        }

        logger.info(`Game session ${sessionId} ended by user ${userId}`);
        res.json({
            success: true,
            message: 'Game session ended successfully'
        });

    } catch (error) {
        logger.error('Error ending game session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save level progress
router.post('/progress', [
    body('levelId').isString().withMessage('Level ID required'),
    body('completed').isBoolean().withMessage('Completion status required'),
    body('score').isInt({ min: 0 }).withMessage('Valid score required'),
    body('timeSpent').isInt({ min: 0 }).withMessage('Valid time spent required'),
    body('attempts').optional().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { levelId, completed, score, timeSpent, attempts = 1 } = req.body;
        const userId = req.user.id;

        const supabase = getSupabase();

        // Get existing progress
        const { data: existingProgress, error: fetchError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('level_id', levelId)
            .single();

        let progressData = {
            user_id: userId,
            level_id: levelId,
            completed,
            score,
            time_spent: timeSpent,
            attempts: existingProgress ? existingProgress.attempts + 1 : attempts,
            updated_at: new Date().toISOString()
        };

        if (completed) {
            progressData.completed_at = new Date().toISOString();

            // Update best score and fastest time
            if (!existingProgress || score > existingProgress.best_score) {
                progressData.best_score = score;
            } else {
                progressData.best_score = existingProgress.best_score;
            }

            if (!existingProgress || timeSpent < existingProgress.fastest_time || existingProgress.fastest_time === 0) {
                progressData.fastest_time = timeSpent;
            } else {
                progressData.fastest_time = existingProgress.fastest_time;
            }
        }

        let result;
        if (existingProgress) {
            // Update existing progress
            const { data, error } = await supabase
                .from('user_progress')
                .update(progressData)
                .eq('id', existingProgress.id)
                .select()
                .single();

            result = { data, error };
        } else {
            // Create new progress
            const { data, error } = await supabase
                .from('user_progress')
                .insert(progressData)
                .select()
                .single();

            result = { data, error };
        }

        if (result.error) {
            logger.error('Error saving progress:', result.error);
            return res.status(500).json({ error: 'Failed to save progress' });
        }

        logger.info(`Progress saved for user ${userId}, level: ${levelId}, completed: ${completed}`);
        res.json({
            success: true,
            message: 'Progress saved successfully',
            progress: result.data
        });

    } catch (error) {
        logger.error('Error saving progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user progress
router.get('/progress', async (req, res) => {
    try {
        const userId = req.user.id;

        const supabase = getSupabase();

        const { data: progress, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            logger.error('Error fetching progress:', error);
            return res.status(500).json({ error: 'Failed to fetch progress' });
        }

        res.json({
            success: true,
            progress
        });

    } catch (error) {
        logger.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get active game session
router.get('/session/active', async (req, res) => {
    try {
        const userId = req.user.id;

        const supabase = getSupabase();

        const { data: session, error } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            logger.error('Error fetching active session:', error);
            return res.status(500).json({ error: 'Failed to fetch active session' });
        }

        res.json({
            success: true,
            session: session || null
        });

    } catch (error) {
        logger.error('Error fetching active session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track equipment interaction
router.post('/equipment/interaction', [
    body('equipmentType').isString().withMessage('Equipment type required'),
    body('equipmentName').isString().withMessage('Equipment name required'),
    body('interactionType').isIn(['selected', 'configured', 'connected', 'purchased']).withMessage('Valid interaction type required'),
    body('interactionData').optional().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { equipmentType, equipmentName, interactionType, interactionData } = req.body;
        const userId = req.user.id;

        const supabase = getSupabase();

        // Get active session
        const { data: session, error: sessionError } = await supabase
            .from('game_sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (sessionError) {
            logger.error('Error fetching active session:', sessionError);
            return res.status(500).json({ error: 'No active game session found' });
        }

        // Record interaction
        const { error } = await supabase
            .from('equipment_interactions')
            .insert({
                user_id: userId,
                session_id: session.id,
                equipment_type: equipmentType,
                equipment_name: equipmentName,
                interaction_type: interactionType,
                interaction_data: interactionData || {},
                created_at: new Date().toISOString()
            });

        if (error) {
            logger.error('Error recording equipment interaction:', error);
            return res.status(500).json({ error: 'Failed to record interaction' });
        }

        logger.info(`Equipment interaction recorded: ${equipmentName} (${interactionType}) for user ${userId}`);
        res.json({
            success: true,
            message: 'Interaction recorded successfully'
        });

    } catch (error) {
        logger.error('Error recording equipment interaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
