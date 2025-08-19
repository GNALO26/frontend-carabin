const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz.questions',
    required: true
  },
  selectedOption: {
    type: Number,
    required: true
  },
  isCorrect: Boolean,
  timeTaken: Number // en secondes
});

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  answers: [answerSchema],
  passed: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

// Calcul automatique du pourcentage
resultSchema.pre('save', function(next) {
  this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  this.passed = this.percentage >= 70;
  next();
});

module.exports = mongoose.model('Result', resultSchema);