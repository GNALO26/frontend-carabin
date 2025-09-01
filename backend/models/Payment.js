const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    default: 5000 
  },
  operator: { 
    type: String 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  transactionId: { 
    type: String, 
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    required: true
  },
  provider: { 
    type: String, 
    default: 'paydunya' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'used'],
    default: 'pending' 
  },
  accessCode: { 
    type: String,
    unique: true
  },
  accessExpiry: { 
    type: Date 
  },
  isCodeUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
paymentSchema.index({ accessCode: 1 });
paymentSchema.index({ userId: 1, isCodeUsed: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);