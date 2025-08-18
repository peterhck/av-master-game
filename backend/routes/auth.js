const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');

const router = express.Router();

// User signup
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('fullName').optional().isLength({ max: 100 }).withMessage('Full name too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, username, fullName } = req.body;

    const supabase = getSupabase();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          full_name: fullName || ''
        }
      }
    });

    if (authError) {
      logger.error('Auth signup error:', authError);
      return res.status(500).json({ 
        error: 'Registration failed',
        message: 'Failed to create user account'
      });
    }

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user_id: authData.user.id
    });

  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'Internal server error during registration'
    });
  }
});

// User login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    const supabase = getSupabase();

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      logger.error('Login error:', authError);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    const user = authData.user;

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username,
        full_name: user.user_metadata?.full_name
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during login'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    const supabase = getSupabase();

    // Refresh session with Supabase
    const { data: authData, error: authError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (authError) {
      logger.error('Token refresh error:', authError);
      return res.status(401).json({ 
        error: 'Token refresh failed',
        message: 'Invalid or expired refresh token'
      });
    }

    const user = authData.user;

    // Generate new JWT token
    const newToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`Token refreshed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username,
        full_name: user.user_metadata?.full_name
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Token refresh failed',
      message: 'Internal server error during token refresh'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const supabase = getSupabase();
      await supabase.auth.signOut({ scope: 'global' });
    }

    logger.info('User logged out');
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      message: 'Internal server error during logout'
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Profile fetch failed',
      message: 'Internal server error while fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('fullName').optional().isLength({ max: 100 }).withMessage('Full name too long'),
  body('avatarUrl').optional().isURL().withMessage('Valid URL required for avatar')
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
    const { username, fullName, avatarUrl } = req.body;

    const supabase = getSupabase();

    // Check if username is already taken
    if (username) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return res.status(409).json({ 
          error: 'Username taken',
          message: 'This username is already in use'
        });
      }
    }

    // Update user profile
    const { data: user, error } = await supabase
      .from('users')
      .update({
        username: username || null,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Profile update error:', error);
      return res.status(500).json({ 
        error: 'Profile update failed',
        message: 'Failed to update user profile'
      });
    }

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Profile update failed',
      message: 'Internal server error while updating profile'
    });
  }
});

module.exports = router;
