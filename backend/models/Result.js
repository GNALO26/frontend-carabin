const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: {
    type: String,
    required: true
  },
  isCorrect: Boolean,
  timeTaken: {
    type: Number,
    default: 0
  }
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
    default: false
  }
}, { timestamps: true });

// Calcul automatique du pourcentage
resultSchema.pre('save', function(next) {
  if (this.totalQuestions > 0) {
    this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  }
  // Si passed n'est pas défini, appliquer 70% par défaut
  if (this.passed === undefined) {
    this.passed = this.percentage >= 70;
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);