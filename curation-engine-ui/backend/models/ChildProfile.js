const mongoose = require('mongoose');

const childProfileSchema = new mongoose.Schema({
  // Basic Information
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 30
  },
  
  // Age and Development
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(dob) {
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        return age >= 0 && age <= 18;
      },
      message: 'Child must be between 0 and 18 years old'
    }
  },
  ageCategory: {
    type: String,
    enum: ['toddler', 'preschool', 'early_elementary', 'late_elementary', 'middle_school', 'high_school'],
    required: true
  },
  
  // Cognitive and Educational Profile
  cognitiveProfile: {
    readingLevel: {
      type: Number,
      min: 1,
      max: 20,
      default: null
    },
    mathLevel: {
      type: Number,
      min: 1,
      max: 20,
      default: null
    },
    attentionSpan: {
      type: String,
      enum: ['short', 'average', 'long'],
      default: 'average'
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
      default: 'mixed'
    },
    specialNeeds: [{
      type: {
        type: String,
        enum: ['dyslexia', 'adhd', 'autism', 'hearing_impaired', 'vision_impaired', 'other']
      },
      description: String,
      accommodations: [String]
    }]
  },
  
  // Content Preferences and Restrictions
  contentPreferences: {
    favoriteSubjects: [{
      type: String,
      enum: ['mathematics', 'science', 'literature', 'history', 'technology', 'arts', 'music', 'sports', 'social_studies']
    }],
    languages: [{
      language: {
        type: String,
        default: 'en'
      },
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native'],
        default: 'native'
      }
    }],
    interests: [String],
    dislikedTopics: [String]
  },
  
  // Safety and Content Filtering Settings
  safetySettings: {
    // Content Rating Restrictions
    maxContentRating: {
      type: String,
      enum: ['G', 'PG', 'PG-13', 'R'],
      default: 'G'
    },
    
    // Violence and Action Content
    allowViolence: {
      level: {
        type: String,
        enum: ['none', 'cartoon', 'mild', 'moderate'],
        default: 'none'
      },
      specificRestrictions: [String]
    },
    
    // Educational Content Requirements
    educationalContentOnly: {
      type: Boolean,
      default: false
    },
    minEducationalValue: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.3
    },
    
    // Social and Communication
    allowSocialInteraction: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: false
    },
    allowDirectMessages: {
      type: Boolean,
      default: false
    },
    
    // Time-based Restrictions
    allowedTimeSlots: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6 // 0 = Sunday, 6 = Saturday
      },
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      timezone: String
    }],
    dailyTimeLimit: {
      type: Number, // minutes
      default: 60
    },
    
    // Content Categories
    blockedCategories: [{
      type: String,
      enum: ['violence', 'scary', 'sexual', 'profanity', 'drugs', 'gambling', 'mature_themes']
    }],
    allowedDomains: [String],
    blockedDomains: [String],
    
    // AI Safety Features
    requireParentalApproval: {
      newContent: {
        type: Boolean,
        default: true
      },
      socialInteraction: {
        type: Boolean,
        default: true
      },
      downloads: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Parental Controls
  parentalControls: {
    monitoringLevel: {
      type: String,
      enum: ['minimal', 'moderate', 'strict', 'complete'],
      default: 'moderate'
    },
    notificationSettings: {
      inappropriateContent: {
        type: Boolean,
        default: true
      },
      timeLimit: {
        type: Boolean,
        default: true
      },
      newFriendRequests: {
        type: Boolean,
        default: true
      },
      weeklyReport: {
        type: Boolean,
        default: true
      }
    },
    emergencyOverride: {
      enabled: {
        type: Boolean,
        default: true
      },
      contacts: [String], // Phone numbers or user IDs
      message: String
    }
  },
  
  // Activity and Analytics
  activityTracking: {
    totalScreenTime: {
      type: Number,
      default: 0 // minutes
    },
    lastActivity: Date,
    weeklyUsage: [{
      week: Date,
      screenTime: Number,
      contentConsumed: Number,
      flaggedContent: Number
    }],
    contentHistory: [{
      contentId: String,
      contentType: String,
      timestamp: Date,
      duration: Number, // seconds
      completed: Boolean,
      rating: Number,
      flagged: Boolean,
      flagReason: String
    }],
    learningProgress: [{
      subject: String,
      level: Number,
      lastAssessment: Date,
      improvements: [String]
    }]
  },
  
  // Health and Wellbeing
  wellbeingMetrics: {
    eyeStrainProtection: {
      type: Boolean,
      default: true
    },
    postureReminders: {
      type: Boolean,
      default: true
    },
    breakReminders: {
      interval: {
        type: Number,
        default: 30 // minutes
      },
      enabled: {
        type: Boolean,
        default: true
      }
    },
    sleepSchedule: {
      bedtime: String, // HH:MM format
      wakeupTime: String, // HH:MM format
      noDeviceBeforeBed: {
        type: Number,
        default: 60 // minutes
      }
    }
  },
  
  // Device and Access Management
  deviceAccess: {
    allowedDevices: [{
      deviceId: String,
      deviceName: String,
      deviceType: {
        type: String,
        enum: ['smartphone', 'tablet', 'computer', 'smart_tv', 'gaming_console']
      },
      lastUsed: Date,
      restrictions: {
        timeLimit: Number,
        apps: [String],
        websites: [String]
      }
    }],
    locationRestrictions: [{
      location: String,
      allowed: Boolean,
      timeRestrictions: {
        start: String,
        end: String
      }
    }]
  },
  
  // Compliance and Legal
  compliance: {
    coppaCompliant: {
      type: Boolean,
      required: true,
      default: true
    },
    parentalConsentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    consentVersion: {
      type: String,
      required: true,
      default: '1.0'
    },
    dataRetentionDate: Date,
    gdprApplicable: {
      type: Boolean,
      default: false
    },
    dpdpaApplicable: {
      type: Boolean,
      default: false
    }
  },
  
  // Profile Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'archived'],
    default: 'active'
  },
  
  // Custom Rules (JSON for flexibility)
  customRules: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['content_filter', 'time_restriction', 'device_control', 'social_restriction']
    },
    conditions: mongoose.Schema.Types.Mixed,
    actions: mongoose.Schema.Types.Mixed,
    enabled: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
childProfileSchema.index({ parentId: 1 });
childProfileSchema.index({ status: 1 });
childProfileSchema.index({ ageCategory: 1 });
childProfileSchema.index({ 'activityTracking.lastActivity': 1 });
childProfileSchema.index({ 'compliance.coppaCompliant': 1 });

// Virtual for current age
childProfileSchema.virtual('currentAge').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for full name
childProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (nickname or first name)
childProfileSchema.virtual('displayName').get(function() {
  return this.nickname || this.firstName;
});

// Virtual for total screen time today
childProfileSchema.virtual('todayScreenTime').get(function() {
  const today = new Date().toDateString();
  const todayHistory = this.activityTracking.contentHistory.filter(
    content => new Date(content.timestamp).toDateString() === today
  );
  
  return todayHistory.reduce((total, content) => total + (content.duration || 0), 0);
});

// Virtual for remaining time today
childProfileSchema.virtual('remainingTimeToday').get(function() {
  const used = this.todayScreenTime;
  const limit = this.safetySettings.dailyTimeLimit * 60; // Convert minutes to seconds
  return Math.max(0, limit - used);
});

// Method to check if content is appropriate
childProfileSchema.methods.isContentAppropriate = function(contentAnalysis) {
  // Check age appropriateness
  const ageMap = {
    'G': 0,
    'PG': 7,
    'PG-13': 13,
    'R': 17
  };
  
  const maxAge = ageMap[this.safetySettings.maxContentRating] || 0;
  if (this.currentAge > maxAge) {
    return false;
  }
  
  // Check educational value requirement
  if (this.safetySettings.educationalContentOnly && 
      contentAnalysis.educationalValue < this.safetySettings.minEducationalValue) {
    return false;
  }
  
  // Check blocked categories
  const hasBlockedCategory = this.safetySettings.blockedCategories.some(
    category => contentAnalysis.categories && contentAnalysis.categories.includes(category)
  );
  
  if (hasBlockedCategory) {
    return false;
  }
  
  // Check violence level
  if (contentAnalysis.violenceLevel && 
      this.safetySettings.allowViolence.level === 'none' && 
      contentAnalysis.violenceLevel > 0.1) {
    return false;
  }
  
  return true;
};

// Method to check if current time is allowed
childProfileSchema.methods.isCurrentTimeAllowed = function() {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().substr(0, 5); // HH:MM format
  
  const allowedSlot = this.safetySettings.allowedTimeSlots.find(slot => {
    return slot.dayOfWeek === currentDay &&
           slot.startTime <= currentTime &&
           slot.endTime >= currentTime;
  });
  
  return !!allowedSlot;
};

// Method to log content activity
childProfileSchema.methods.logContentActivity = function(contentData) {
  this.activityTracking.contentHistory.push({
    contentId: contentData.id,
    contentType: contentData.type,
    timestamp: new Date(),
    duration: contentData.duration || 0,
    completed: contentData.completed || false,
    rating: contentData.rating,
    flagged: contentData.flagged || false,
    flagReason: contentData.flagReason
  });
  
  // Keep only last 1000 entries
  if (this.activityTracking.contentHistory.length > 1000) {
    this.activityTracking.contentHistory = this.activityTracking.contentHistory.slice(-1000);
  }
  
  // Update total screen time
  this.activityTracking.totalScreenTime += (contentData.duration || 0);
  this.activityTracking.lastActivity = new Date();
  
  return this.save();
};

// Method to get weekly usage summary
childProfileSchema.methods.getWeeklyUsage = function(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const weekHistory = this.activityTracking.contentHistory.filter(
    content => {
      const contentDate = new Date(content.timestamp);
      return contentDate >= weekStart && contentDate < weekEnd;
    }
  );
  
  return {
    week: weekStart,
    screenTime: weekHistory.reduce((total, content) => total + (content.duration || 0), 0),
    contentConsumed: weekHistory.length,
    flaggedContent: weekHistory.filter(content => content.flagged).length
  };
};

// Method to update age category based on current age
childProfileSchema.methods.updateAgeCategory = function() {
  const age = this.currentAge;
  
  if (age < 2) {
    this.ageCategory = 'toddler';
  } else if (age < 5) {
    this.ageCategory = 'preschool';
  } else if (age < 8) {
    this.ageCategory = 'early_elementary';
  } else if (age < 11) {
    this.ageCategory = 'late_elementary';
  } else if (age < 14) {
    this.ageCategory = 'middle_school';
  } else {
    this.ageCategory = 'high_school';
  }
  
  return this.save();
};

// Static method to find children by parent
childProfileSchema.statics.findByParent = function(parentId) {
  return this.find({ parentId, status: 'active' })
    .populate('parentId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get analytics for all children of a parent
childProfileSchema.statics.getParentAnalytics = function(parentId) {
  return this.aggregate([
    { $match: { parentId: mongoose.Types.ObjectId(parentId), status: 'active' } },
    {
      $group: {
        _id: '$parentId',
        totalChildren: { $sum: 1 },
        totalScreenTime: { $sum: '$activityTracking.totalScreenTime' },
        averageAge: { $avg: '$currentAge' },
        activeChildren: {
          $sum: {
            $cond: [
              { $gte: ['$activityTracking.lastActivity', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Pre-save middleware to validate and update age category
childProfileSchema.pre('save', function(next) {
  // Auto-update age category if date of birth changed
  if (this.isModified('dateOfBirth')) {
    this.updateAgeCategory();
  }
  
  // Validate time slots
  if (this.isModified('safetySettings.allowedTimeSlots')) {
    for (let slot of this.safetySettings.allowedTimeSlots) {
      if (slot.startTime >= slot.endTime) {
        return next(new Error('Start time must be before end time'));
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('ChildProfile', childProfileSchema);
