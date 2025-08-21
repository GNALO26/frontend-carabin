const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length >= 2, 'Doit avoir au moins 2 options']
  },
  correctAnswers: {
    type: [Number],
    required: true
  },
  justification: String,
  imageUrl: String
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  duration: { type: Number, default: 30 },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: [
      'tissu-epithelial', 
      'tissu-conjonctif', 
      'tissu-cartilagineux', 
      'tissu-osseux', 
      'physiologie-renale',
      'cardiologie', // Ajout de nouvelles catégories
      'pharmacologie',
      'neurologie',
      'anatomie'
    ],
    default: 'physiologie-renale'
  },
  difficulty: {
    type: String,
    enum: ['facile', 'moyen', 'difficile'],
    default: 'moyen'
  },
  free: { type: Boolean, default: true }
});

quizSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);