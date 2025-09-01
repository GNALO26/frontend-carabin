const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscriptionStart: Date,
  subscriptionEnd: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  currentSessionId: {
    type: String,
    default: null
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Méthodes existantes (hash, comparePassword, etc.)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.hasActiveSubscription = function() {
  return this.isSubscribed && 
         this.subscriptionEnd && 
         new Date() < this.subscriptionEnd;
};

// Méthode pour invalider la session
userSchema.methods.invalidateSession = function() {
  this.currentSessionId = null;
  return this.save();
};

// Méthode pour créer une nouvelle session
userSchema.methods.createNewSession = function() {
  const { v4: uuidv4 } = require('uuid');
  this.currentSessionId = uuidv4();
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);