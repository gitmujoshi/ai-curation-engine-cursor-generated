const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't include password in queries by default
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
  
  // User Type and Roles
  role: {
    type: String,
    enum: ['parent', 'admin', 'moderator'],
    default: 'parent'
  },
  
  // Age Verification Status
  ageVerificationStatus: {
    verified: {
      type: Boolean,
      default: false
    },
    verificationMethod: {
      type: String,
      enum: ['zkp', 'document', 'biometric', 'none'],
      default: 'none'
    },
    verificationDate: Date,
    verificationProvider: String,
    ageCategory: {
      type: String,
      enum: ['under_13', 'under_16', 'under_18', 'adult'],
      default: 'adult'
    }
  },
  
  // Profile Information
  profile: {
    phoneNumber: {
      type: String,
      validate: {
        validator: function(phone) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
        },
        message: 'Please enter a valid phone number'
      }
    },
    country: {
      type: String,
      enum: ['US', 'EU', 'IN', 'CN', 'CA', 'AU', 'UK', 'other'],
      default: 'US'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    avatar: String,
    bio: {
      type: String,
      maxlength: 500
    }
  },
  
  // Parental Information (for parent accounts)
  parentalInfo: {
    numberOfChildren: {
      type: Number,
      min: 0,
      max: 20,
      default: 0
    },
    primaryGuardian: {
      type: Boolean,
      default: true
    },
    emergencyContact: {
      name: String,
      phone: String,
      email: String,
      relationship: String
    }
  },
  
  // Security Settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  
  // Privacy and Consent
  consent: {
    dataProcessing: {
      given: Boolean,
      date: Date,
      version: String
    },
    marketing: {
      given: {
        type: Boolean,
        default: false
      },
      date: Date
    },
    analytics: {
      given: {
        type: Boolean,
        default: true
      },
      date: Date
    }
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      weekly_reports: {
        type: Boolean,
        default: true
      },
      safety_alerts: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['private', 'friends', 'public'],
        default: 'private'
      },
      dataSharing: {
        type: Boolean,
        default: false
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'children', 'analytics', 'rules'],
        default: 'overview'
      },
      compactMode: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Subscription and Usage
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial'],
      default: 'trial'
    },
    startDate: Date,
    endDate: Date,
    features: [{
      name: String,
      enabled: Boolean
    }]
  },
  
  // Activity Tracking
  activity: {
    lastLogin: Date,
    lastActivity: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    ipAddresses: [{
      ip: String,
      timestamp: Date,
      location: String
    }]
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  
  // Compliance and Legal
  compliance: {
    gdprConsent: {
      given: Boolean,
      date: Date,
      withdrawnDate: Date
    },
    coppaCompliant: {
      type: Boolean,
      default: false
    },
    dataRetentionDate: Date,
    rightToErasureRequested: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'ageVerificationStatus.verified': 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ 'activity.lastLogin': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account age
userSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to increment failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.failedLoginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.failedLoginAttempts': 1 } };
  
  // If we have max attempts and we're not locked already, lock the account
  if (this.security.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      'security.failedLoginAttempts': 1,
      'security.lockUntil': 1
    }
  });
};

// Method to update last activity
userSchema.methods.updateActivity = function(ipAddress, location) {
  const updates = {
    'activity.lastActivity': new Date(),
    $inc: { 'activity.loginCount': 1 }
  };
  
  if (ipAddress) {
    updates.$push = {
      'activity.ipAddresses': {
        $each: [{ ip: ipAddress, timestamp: new Date(), location }],
        $slice: -10 // Keep only last 10 IP addresses
      }
    };
  }
  
  return this.updateOne(updates);
};

// Method to check if user can access certain features based on subscription
userSchema.methods.hasFeature = function(featureName) {
  if (this.subscription.status !== 'active') {
    return false;
  }
  
  const feature = this.subscription.features.find(f => f.name === featureName);
  return feature ? feature.enabled : false;
};

// Static method to find users by country for compliance
userSchema.statics.findByCountryForCompliance = function(country) {
  return this.find({
    'profile.country': country,
    status: 'active'
  }).select('email firstName lastName compliance createdAt');
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.security.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
