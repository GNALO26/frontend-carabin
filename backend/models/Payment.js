const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String },
  amount: { type: Number, required: true, default: 5000 },
  operator: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  transactionId: { type: String },
  provider: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  accessCode: { type: String },
  accessExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
