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
    lowercase: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscription: {
    isActive: {
      type: Boolean,
      default: false
    },
    expiryDate: Date,
    accessCode: String,
    activatedAt: Date
  },
  lastLogin: Date,
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }]
}, {
  timestamps: true
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Check if user has premium access
userSchema.methods.hasPremiumAccess = function() {
  return this.subscription.isActive && 
         this.subscription.expiryDate && 
         this.subscription.expiryDate > new Date();
};

// Virtual for subscription status
userSchema.virtual('subscriptionStatus').get(function() {
  if (this.subscription.isActive && this.subscription.expiryDate > new Date()) {
    return 'active';
  } else if (this.subscription.isActive && this.subscription.expiryDate <= new Date()) {
    return 'expired';
  } else {
    return 'inactive';
  }
});

// Transform output to remove password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);