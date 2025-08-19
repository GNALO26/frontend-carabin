const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtenir tous les quiz
router.get('/', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, 'title description duration category difficulty');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir un quiz spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Commencer un quiz
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    // Enregistrer le début du quiz
    res.json({
      quizId: quiz._id,
      totalQuestions: quiz.questions.length,
      startTime: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Soumettre les réponses d'un quiz
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers, startTime } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    // Calculer le score
    let score = 0;
    const detailedAnswers = [];
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.correctAnswer === userAnswer;
      
      if (isCorrect) score++;
      
      detailedAnswers.push({
        questionId: question._id,
        selectedOption: userAnswer,
        isCorrect,
        timeTaken: answers[index].timeTaken
      });
    });
    
    // Enregistrer le résultat
    const result = new Result({
      userId: req.user._id,
      quizId: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      startTime: new Date(startTime),
      endTime: new Date(),
      answers: detailedAnswers
    });
    
    await result.save();
    
    res.json({
      score,
      totalQuestions: quiz.questions.length,
      percentage: result.percentage,
      passed: result.passed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;