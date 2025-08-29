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
  // Champs d'abonnement unifiés
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscriptionStart: {
    type: Date,
    default: null
  },
  subscriptionEnd: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Suppression de l'objet subscription dupliqué
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

// Vérifier si l'utilisateur a un abonnement actif
userSchema.methods.hasActiveSubscription = function() {
  return this.isSubscribed && 
         this.subscriptionEnd && 
         new Date() < this.subscriptionEnd;
};

// Virtual pour le statut de l'abonnement
userSchema.virtual('subscriptionStatus').get(function() {
  if (this.isSubscribed && this.subscriptionEnd && new Date() < this.subscriptionEnd) {
    return 'active';
  } else if (this.isSubscribed && this.subscriptionEnd && this.subscriptionEnd <= new Date()) {
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