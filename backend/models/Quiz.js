const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'Doit avoir au moins 2 options']
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: String,
  imageUrl: String
});

function arrayLimit(val) {
  return val.length >= 2;
}

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  duration: {
    type: Number, // en minutes
    required: true,
    min: 1
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['tissu-epithelial', 'tissu-conjonctif', 'tissu-cartilagineux', 'tissu-osseux'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['facile', 'moyen', 'difficile'],
    default: 'moyen'
  }
});

// Mise à jour de la date de modification
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);