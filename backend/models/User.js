const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }]
});

// Méthode pour vérifier l'accès premium
userSchema.methods.hasPremiumAccess = async function() {
  const Subscription = mongoose.model('Subscription');
  const activeSub = await Subscription.findOne({
    userId: this._id,
    expiryDate: { $gt: new Date() }
  });
  return !!activeSub;
};

module.exports = mongoose.model('User', userSchema);
