const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length >= 2, 'Doit avoir au moins 2 options']
  },
  correctAnswers: {
    type: [Number], // plusieurs réponses possibles (index des options correctes)
    required: true
  },
  justification: String,
  imageUrl: String
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  duration: { type: Number, default: 30 }, // en minutes
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['tissu-epithelial', 'tissu-conjonctif', 'tissu-cartilagineux', 'tissu-osseux', 'physiologie-renale'],
    default: 'physiologie-renale'
  },
  difficulty: {
    type: String,
    enum: ['facile', 'moyen', 'difficile'],
    default: 'moyen'
  },
  free: { type: Boolean, default: true }
});

// Mise à jour automatique de la date
quizSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
