const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const logger = require('winston');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  country: Joi.string().valid('US', 'EU', 'IN', 'CN', 'CA', 'AU', 'UK', 'other').default('US'),
  consent: Joi.object({
    dataProcessing: Joi.boolean().valid(true).required(),
    marketing: Joi.boolean().default(false),
    analytics: Joi.boolean().default(true)
  }).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().default(false)
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required()
});

// Helper function to generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    const { email, password, firstName, lastName, phoneNumber, country, consent } = value;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists'
      });
    }
    
    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      'profile.phoneNumber': phoneNumber,
      'profile.country': country,
      consent: {
        dataProcessing: {
          given: consent.dataProcessing,
          date: new Date(),
          version: '1.0'
        },
        marketing: {
          given: consent.marketing,
          date: new Date()
        },
        analytics: {
          given: consent.analytics,
          date: new Date()
        }
      },
      status: 'pending_verification'
    });
    
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Log registration
    logger.info('User registered', {
      userId: user._id,
      email: user.email,
      country: user.profile.country,
      ip: req.ip
    });
    
    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.security;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    const { email, password, rememberMe } = value;
    
    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }
    
    // Check if account is active
    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    // Reset failed login attempts on successful login
    if (user.security.failedLoginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Update user activity
    await user.updateActivity(req.ip, req.get('User-Agent'));
    
    // Generate tokens
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id, type: 'refresh' },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Log successful login
    logger.info('User logged in', {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.security;
    
    res.json({
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Invalid refresh token'
      });
    }
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: 'User not found or inactive',
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      });
    }
    
    logger.error('Token refresh error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing token'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    const { email } = value;
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    const successResponse = {
      message: 'If an account with that email exists, a password reset link has been sent.'
    };
    
    if (!user) {
      return res.json(successResponse);
    }
    
    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // TODO: Send email with reset token
    // For now, we'll just log it (in production, send actual email)
    logger.info('Password reset requested', {
      userId: user._id,
      email: user.email,
      resetToken, // Remove this in production
      ip: req.ip
    });
    
    res.json(successResponse);
    
  } catch (error) {
    logger.error('Forgot password error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while processing password reset'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    const { token, password } = value;
    
    // Hash the token to compare with stored hash
    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid reset token
    const user = await User.findOne({
      'security.passwordResetToken': hashedToken,
      'security.passwordResetExpires': { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // Update password
    user.password = password;
    user.security.passwordResetToken = undefined;
    user.security.passwordResetExpires = undefined;
    user.security.lastPasswordChange = new Date();
    user.security.failedLoginAttempts = 0;
    user.security.lockUntil = undefined;
    
    await user.save();
    
    // Log password reset
    logger.info('Password reset completed', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });
    
    res.json({
      message: 'Password has been reset successfully'
    });
    
  } catch (error) {
    logger.error('Reset password error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while resetting password'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  // In a stateless JWT implementation, logout is handled client-side
  // by removing the token from storage. Server-side, we just log the event.
  
  logger.info('User logged out', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json({
    message: 'Logged out successfully'
  });
});

// @route   GET /api/auth/verify
// @desc    Verify token and return user info
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Access token is required'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Invalid token'
      });
    }
    
    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.security;
    
    res.json({
      valid: true,
      user: userResponse
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        valid: false,
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
    
    logger.error('Token verification error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred while verifying token'
    });
  }
});

module.exports = router;
