const express = require('express');
const { body, validationResult } = require('express-validator');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');

const router = express.Router();

// Get user settings
router.get('/settings', async (req, res) => {
    try {
        const userId = req.user.id;

        const supabase = getSupabase();

        const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            logger.error('Error fetching user settings:', error);
            return res.status(500).json({ error: 'Failed to fetch user settings' });
        }

        // Return default settings if none exist
        const defaultSettings = {
            ai_tutor_enabled: true,
            voice_enabled: true,
            notifications_enabled: true,
            theme: 'dark',
            language: 'en',
            accessibility_settings: {}
        };

        res.json({
            success: true,
            settings: settings || defaultSettings
        });

    } catch (error) {
        logger.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user settings
router.put('/settings', [
    body('aiTutorEnabled').optional().isBoolean(),
    body('voiceEnabled').optional().isBoolean(),
    body('notificationsEnabled').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark']),
    body('language').optional().isIn(['en', 'es', 'fr', 'de']),
    body('accessibilitySettings').optional().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.user.id;
        const {
            aiTutorEnabled,
            voiceEnabled,
            notificationsEnabled,
            theme,
            language,
            accessibilitySettings
        } = req.body;

        const supabase = getSupabase();

        // Check if settings exist
        const { data: existingSettings, error: fetchError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        const updateData = {};
        if (aiTutorEnabled !== undefined) updateData.ai_tutor_enabled = aiTutorEnabled;
        if (voiceEnabled !== undefined) updateData.voice_enabled = voiceEnabled;
        if (notificationsEnabled !== undefined) updateData.notifications_enabled = notificationsEnabled;
        if (theme) updateData.theme = theme;
        if (language) updateData.language = language;
        if (accessibilitySettings) updateData.accessibility_settings = accessibilitySettings;

        let result;
        if (existingSettings) {
            // Update existing settings
            const { data, error } = await supabase
                .from('user_settings')
                .update(updateData)
                .eq('id', existingSettings.id)
                .select()
                .single();

            result = { data, error };
        } else {
            // Create new settings
            const { data, error } = await supabase
                .from('user_settings')
                .insert({
                    user_id: userId,
                    ...updateData
                })
                .select()
                .single();

            result = { data, error };
        }

        if (result.error) {
            logger.error('Error updating user settings:', result.error);
            return res.status(500).json({ error: 'Failed to update user settings' });
        }

        logger.info(`User settings updated for user ${userId}`);
        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings: result.data
        });

    } catch (error) {
        logger.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user achievements
router.get('/achievements', async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        const supabase = getSupabase();

        const { data: achievements, error } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (error) {
            logger.error('Error fetching user achievements:', error);
            return res.status(500).json({ error: 'Failed to fetch user achievements' });
        }

        res.json({
            success: true,
            achievements,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        logger.error('Error fetching user achievements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Award achievement
router.post('/achievements', [
    body('achievementType').isString().withMessage('Achievement type required'),
    body('achievementName').isString().withMessage('Achievement name required'),
    body('description').optional().isString(),
    body('metadata').optional().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.user.id;
        const { achievementType, achievementName, description, metadata } = req.body;

        const supabase = getSupabase();

        // Check if achievement already exists
        const { data: existingAchievement, error: checkError } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('achievement_type', achievementType)
            .eq('achievement_name', achievementName)
            .single();

        if (existingAchievement) {
            return res.status(409).json({
                error: 'Achievement already earned',
                message: 'This achievement has already been awarded'
            });
        }

        // Award achievement
        const { data: achievement, error } = await supabase
            .from('user_achievements')
            .insert({
                user_id: userId,
                achievement_type: achievementType,
                achievement_name: achievementName,
                description: description || '',
                metadata: metadata || {},
                earned_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            logger.error('Error awarding achievement:', error);
            return res.status(500).json({ error: 'Failed to award achievement' });
        }

        logger.info(`Achievement awarded to user ${userId}: ${achievementName}`);
        res.status(201).json({
            success: true,
            message: 'Achievement awarded successfully',
            achievement
        });

    } catch (error) {
        logger.error('Error awarding achievement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get API usage statistics
router.get('/api-usage', async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 30 } = req.query;

        const supabase = getSupabase();

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const { data: usage, error } = await supabase
            .from('api_usage')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching API usage:', error);
            return res.status(500).json({ error: 'Failed to fetch API usage' });
        }

        // Calculate statistics
        const stats = {
            total_requests: usage.length,
            successful_requests: usage.filter(u => u.success).length,
            failed_requests: usage.filter(u => !u.success).length,
            total_tokens: usage.reduce((sum, u) => sum + (u.tokens_used || 0), 0),
            total_cost: usage.reduce((sum, u) => sum + parseFloat(u.cost_usd || 0), 0),
            by_type: {}
        };

        // Group by API type
        usage.forEach(u => {
            if (!stats.by_type[u.api_type]) {
                stats.by_type[u.api_type] = {
                    requests: 0,
                    tokens: 0,
                    cost: 0
                };
            }
            stats.by_type[u.api_type].requests++;
            stats.by_type[u.api_type].tokens += u.tokens_used || 0;
            stats.by_type[u.api_type].cost += parseFloat(u.cost_usd || 0);
        });

        res.json({
            success: true,
            usage_stats: stats,
            usage_data: usage
        });

    } catch (error) {
        logger.error('Error fetching API usage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;

        const supabase = getSupabase();

        // Get various statistics
        const [
            progressResult,
            sessionsResult,
            achievementsResult,
            conversationsResult
        ] = await Promise.all([
            supabase.from('user_progress').select('*').eq('user_id', userId),
            supabase.from('game_sessions').select('*').eq('user_id', userId),
            supabase.from('user_achievements').select('*').eq('user_id', userId),
            supabase.from('ai_conversations').select('*').eq('user_id', userId)
        ]);

        if (progressResult.error || sessionsResult.error || achievementsResult.error || conversationsResult.error) {
            logger.error('Error fetching user statistics:', {
                progress: progressResult.error,
                sessions: sessionsResult.error,
                achievements: achievementsResult.error,
                conversations: conversationsResult.error
            });
            return res.status(500).json({ error: 'Failed to fetch user statistics' });
        }

        const stats = {
            total_levels_completed: progressResult.data.filter(p => p.completed).length,
            total_levels_attempted: progressResult.data.length,
            total_game_sessions: sessionsResult.data.length,
            total_achievements: achievementsResult.data.length,
            total_ai_conversations: conversationsResult.data.length,
            average_score: progressResult.data.length > 0
                ? progressResult.data.reduce((sum, p) => sum + p.score, 0) / progressResult.data.length
                : 0,
            total_time_spent: progressResult.data.reduce((sum, p) => sum + p.time_spent, 0)
        };

        res.json({
            success: true,
            statistics: stats
        });

    } catch (error) {
        logger.error('Error fetching user statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
