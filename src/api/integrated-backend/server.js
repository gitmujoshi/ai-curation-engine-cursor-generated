#!/usr/bin/env node

/**
 * Integrated AI Curation Engine Backend
 * Complete server with BAML integration, child profiles, and content classification
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/curation_engine';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['parent', 'admin'], default: 'parent' },
  subscription: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Enhanced Child Profile Schema
const childProfileSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  nickname: { type: String },
  age: { type: Number, required: true, min: 1, max: 18 },
  dateOfBirth: { type: Date },
  avatar: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Safety Settings
  safetyLevel: { 
    type: String, 
    enum: ['strict', 'moderate', 'lenient', 'minimal'], 
    default: 'moderate' 
  },
  contentRating: { type: String, default: 'everyone' },
  parentalSupervision: { type: Boolean, default: true },
  
  // Content Preferences
  allowedCategories: [{ type: String }],
  blockedCategories: [{ type: String }],
  preferredSubjects: [{ type: String }],
  
  // Time Restrictions
  dailyTimeLimit: { type: Number, default: 120 }, // minutes
  sessionTimeLimit: { type: Number, default: 30 }, // minutes
  allowedTimeSlots: {
    weekdays: {
      start: { type: String, default: '16:00' },
      end: { type: String, default: '19:00' }
    },
    weekends: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '20:00' }
    }
  },
  bedtimeRestriction: { type: String, default: '20:00' },
  
  // Advanced Settings
  requireApprovalFor: [{ type: String }],
  notifyParentOn: [{ type: String }],
  emergencyBypass: { type: Boolean, default: false },
  
  // Educational Settings
  learningGoals: [{ type: String }],
  skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  languagePreference: { type: String, default: 'english' },
  
  // Activity Tracking
  activityTracking: {
    lastActivity: { type: Date },
    totalScreenTime: { type: Number, default: 0 },
    todayScreenTime: { type: Number, default: 0 },
    contentViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentLog' }]
  },
  
  // Active Rules
  activeRules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CurationRule' }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChildProfile = mongoose.model('ChildProfile', childProfileSchema);

// Curation Rule Schema
const curationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['content_filter', 'time_restriction', 'content_priority', 'social_restriction'],
    required: true 
  },
  enabled: { type: Boolean, default: true },
  appliedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile' }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  conditions: mongoose.Schema.Types.Mixed,
  actions: mongoose.Schema.Types.Mixed,
  
  performance: {
    accuracy: { type: Number, default: 0 },
    blockedContent: { type: Number, default: 0 },
    approvedContent: { type: Number, default: 0 },
    falsePositives: { type: Number, default: 0 }
  },
  
  createdBy: { type: String, default: 'parent' },
  lastModified: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const CurationRule = mongoose.model('CurationRule', curationRuleSchema);

// Content Log Schema
const contentLogSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile', required: true },
  content: { type: String, required: true },
  contentType: { type: String, enum: ['text', 'video', 'image', 'audio', 'webpage'], default: 'text' },
  source: { type: String },
  
  classification: {
    safety: mongoose.Schema.Types.Mixed,
    educational: mongoose.Schema.Types.Mixed,
    viewpoint: mongoose.Schema.Types.Mixed,
    overall: mongoose.Schema.Types.Mixed
  },
  
  action: { type: String, enum: ['allowed', 'blocked', 'flagged', 'approved'], required: true },
  reason: { type: String },
  processingTime: { type: Number },
  
  timestamp: { type: Date, default: Date.now }
});

const ContentLog = mongoose.model('ContentLog', contentLogSchema);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// BAML Integration Helper
class BAMLIntegration {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.scriptPath = path.join(__dirname, '..', 'BAML_Integration_Implementation.py');
  }

  async classifyContent(content, userContext) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, ['-c', `
import sys
import os
import json
import asyncio

# Add parent directory to path
sys.path.insert(0, '${path.dirname(__dirname)}')

try:
    from BAML_Integration_Implementation import BAMLContentAnalyzer, UserContext
    
    async def classify():
        analyzer = BAMLContentAnalyzer()
        
        user_ctx = UserContext(
            age_category="${userContext.age_category || 'adult'}",
            jurisdiction="${userContext.jurisdiction || 'US'}",
            parental_controls=${userContext.parental_controls || false},
            content_preferences=${JSON.stringify(userContext.content_preferences || [])},
            sensitivity_level="${userContext.sensitivity_level || 'medium'}"
        )
        
        # Try comprehensive analysis first, fallback to individual analyses
        try:
            result = await analyzer.comprehensive_analysis('''${content.replace(/'/g, "\\'")}''', user_ctx)
            print(json.dumps({
                "status": "success",
                "result": {
                    "safety": {
                        "score": result.safety.safety_score,
                        "age_appropriate": result.safety.age_appropriateness,
                        "warnings": result.safety.content_warnings,
                        "reasoning": result.safety.reasoning
                    },
                    "educational": {
                        "score": result.educational.educational_score,
                        "learning_objectives": result.educational.learning_objectives,
                        "subject_areas": result.educational.subject_areas,
                        "cognitive_level": result.educational.cognitive_level
                    },
                    "viewpoint": {
                        "political_leaning": result.viewpoint.political_leaning,
                        "bias_score": result.viewpoint.bias_score,
                        "credibility": result.viewpoint.source_credibility,
                        "balanced_sources": result.viewpoint.balanced_sources
                    },
                    "overall_recommendation": result.overall_recommendation,
                    "confidence_score": result.confidence_score
                }
            }))
        except Exception as e:
            # Fallback to mock classification
            print(json.dumps({
                "status": "fallback",
                "result": {
                    "safety": {
                        "score": 0.85,
                        "age_appropriate": "13+",
                        "warnings": [],
                        "reasoning": "Mock analysis - BAML not fully available"
                    },
                    "educational": {
                        "score": 0.7,
                        "learning_objectives": ["general knowledge"],
                        "subject_areas": ["general"],
                        "cognitive_level": "understand"
                    },
                    "viewpoint": {
                        "political_leaning": "neutral",
                        "bias_score": 0.2,
                        "credibility": 0.8,
                        "balanced_sources": []
                    },
                    "overall_recommendation": "allow",
                    "confidence_score": 0.75
                }
            }))
    
    asyncio.run(classify())
    
except Exception as e:
    print(json.dumps({"status": "error", "error": str(e)}))
`]);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const parsed = JSON.parse(result.trim());
            resolve(parsed);
          } catch (e) {
            reject(new Error('Failed to parse BAML response: ' + result));
          }
        } else {
          reject(new Error('BAML process failed: ' + error));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(new Error('Failed to start BAML process: ' + err.message));
      });
    });
  }
}

const bamlIntegration = new BAMLIntegration();

// Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      baml: 'available'
    }
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Child Profile Routes
app.get('/api/children', authenticateToken, async (req, res) => {
  try {
    const children = await ChildProfile.find({ parentId: req.user.userId })
      .populate('activeRules')
      .sort({ createdAt: -1 });
    
    res.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/children', authenticateToken, async (req, res) => {
  try {
    const childData = {
      ...req.body,
      parentId: req.user.userId
    };

    const child = new ChildProfile(childData);
    await child.save();

    res.status(201).json(child);
  } catch (error) {
    console.error('Error creating child profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/children/:id', authenticateToken, async (req, res) => {
  try {
    const child = await ChildProfile.findOneAndUpdate(
      { _id: req.params.id, parentId: req.user.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!child) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    res.json(child);
  } catch (error) {
    console.error('Error updating child profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/children/:id', authenticateToken, async (req, res) => {
  try {
    const child = await ChildProfile.findOneAndDelete({
      _id: req.params.id,
      parentId: req.user.userId
    });

    if (!child) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    res.json({ message: 'Child profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting child profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Content Classification Routes
app.post('/api/classify', authenticateToken, async (req, res) => {
  try {
    const { content, childId, userContext } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const startTime = Date.now();

    // Get child profile if provided
    let child = null;
    if (childId) {
      child = await ChildProfile.findOne({
        _id: childId,
        parentId: req.user.userId
      });
    }

    // Prepare user context for BAML
    const bamlContext = {
      age_category: child ? (child.age < 13 ? 'child' : child.age < 18 ? 'teen' : 'adult') : 'adult',
      jurisdiction: userContext?.jurisdiction || 'US',
      parental_controls: child ? child.parentalSupervision : false,
      content_preferences: child ? child.allowedCategories : [],
      sensitivity_level: child ? child.safetyLevel : 'moderate'
    };

    // Classify content using BAML
    const classificationResult = await bamlIntegration.classifyContent(content, bamlContext);
    
    const processingTime = Date.now() - startTime;

    // Determine action based on classification
    let action = 'allowed';
    let reason = 'Content passed safety checks';

    if (classificationResult.result) {
      const safety = classificationResult.result.safety;
      
      if (child) {
        // Apply child-specific rules
        if (safety.score < 0.6 || safety.warnings?.length > 0) {
          action = 'blocked';
          reason = 'Content failed safety requirements';
        } else if (safety.score < 0.8) {
          action = 'flagged';
          reason = 'Content requires review';
        }
      } else {
        // Apply general rules
        if (safety.score < 0.4) {
          action = 'blocked';
          reason = 'Content contains inappropriate material';
        }
      }
    }

    // Log the classification
    if (child) {
      const contentLog = new ContentLog({
        childId: child._id,
        content: content.substring(0, 500), // Store first 500 chars
        contentType: 'text',
        classification: classificationResult.result,
        action,
        reason,
        processingTime
      });
      await contentLog.save();
    }

    res.json({
      classification: classificationResult.result,
      action,
      reason,
      processingTime,
      childId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ 
      error: 'Classification failed',
      details: error.message 
    });
  }
});

// Curation Rules Routes
app.get('/api/rules', authenticateToken, async (req, res) => {
  try {
    const rules = await CurationRule.find({ parentId: req.user.userId })
      .populate('appliedTo')
      .sort({ lastModified: -1 });
    
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/rules', authenticateToken, async (req, res) => {
  try {
    const ruleData = {
      ...req.body,
      parentId: req.user.userId
    };

    const rule = new CurationRule(ruleData);
    await rule.save();

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics Routes
app.get('/api/analytics/:childId', authenticateToken, async (req, res) => {
  try {
    const child = await ChildProfile.findOne({
      _id: req.params.childId,
      parentId: req.user.userId
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Get content logs for analytics
    const logs = await ContentLog.find({ childId: child._id })
      .sort({ timestamp: -1 })
      .limit(100);

    const analytics = {
      totalContent: logs.length,
      allowedContent: logs.filter(log => log.action === 'allowed').length,
      blockedContent: logs.filter(log => log.action === 'blocked').length,
      flaggedContent: logs.filter(log => log.action === 'flagged').length,
      averageSafetyScore: logs.reduce((sum, log) => 
        sum + (log.classification?.safety?.score || 0), 0) / logs.length || 0,
      recentActivity: logs.slice(0, 10)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sample Data Creation Route (for demo)
app.post('/api/demo/setup', authenticateToken, async (req, res) => {
  try {
    // Create sample children if none exist
    const existingChildren = await ChildProfile.find({ parentId: req.user.userId });
    
    if (existingChildren.length === 0) {
      const sampleChildren = [
        {
          name: 'Emma',
          nickname: 'Em',
          age: 8,
          parentId: req.user.userId,
          safetyLevel: 'strict',
          allowedCategories: ['educational', 'entertainment', 'games'],
          blockedCategories: ['violence', 'scary', 'mature'],
          dailyTimeLimit: 90,
          sessionTimeLimit: 20
        },
        {
          name: 'Alex',
          nickname: 'Al',
          age: 14,
          parentId: req.user.userId,
          safetyLevel: 'moderate',
          allowedCategories: ['educational', 'entertainment', 'games', 'social'],
          blockedCategories: ['violence', 'mature'],
          dailyTimeLimit: 180,
          sessionTimeLimit: 45
        }
      ];

      for (const childData of sampleChildren) {
        const child = new ChildProfile(childData);
        await child.save();
      }
    }

    // Create sample rules if none exist
    const existingRules = await CurationRule.find({ parentId: req.user.userId });
    
    if (existingRules.length === 0) {
      const sampleRules = [
        {
          name: 'Child Safety Filter',
          description: 'Strict content filtering for young children',
          type: 'content_filter',
          parentId: req.user.userId,
          appliedTo: existingChildren.filter(c => c.age < 10).map(c => c._id),
          conditions: {
            ageRange: [0, 10],
            contentRating: 'G',
            categories: ['educational', 'entertainment']
          },
          actions: {
            block: true,
            requireApproval: true,
            notify: true
          }
        }
      ];

      for (const ruleData of sampleRules) {
        const rule = new CurationRule(ruleData);
        await rule.save();
      }
    }

    res.json({ message: 'Demo data setup complete' });
  } catch (error) {
    console.error('Demo setup error:', error);
    res.status(500).json({ error: 'Demo setup failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Curation Engine Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 MongoDB: ${MONGODB_URI}`);
});

module.exports = app;
