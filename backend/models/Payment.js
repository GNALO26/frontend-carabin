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
    type: String, 
    required: true 
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
    default: 'cinetpay' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  accessCode: { 
    type: String 
  },
  accessExpiry: { 
    type: Date 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);