const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const authMiddleware = require('../middlewares/authMiddleware');
const checkSubscription = require('../middlewares/checkSubscription');

// Quiz en vedette (3 gratuits)
router.get('/featured', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ free: true }).limit(3);
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Quiz gratuits accessibles à tous
router.get('/public', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ free: true }, 'title description duration category free');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Quiz gratuits
router.get('/free', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ free: true }, 'title description duration category free');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Quiz premium → abonnés
router.get('/premium', authMiddleware, checkSubscription, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ free: false }, 'title description duration category free');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Tous les quiz
router.get('/', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, 'title description duration category free');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Quiz spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Commencer un quiz
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });

    const startTime = new Date();
    res.json({ quiz, startTime: startTime.toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Soumettre les réponses
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers, startTime } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });

    let score = 0;
    const results = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = question.correctAnswers.includes(parseInt(answer.selectedOption));
      if (isCorrect) score++;

      return {
        questionId: question._id,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeTaken: answer.timeTaken || 0
      };
    });

    const result = new Result({
      userId: req.user._id,
      quizId: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      startTime: new Date(startTime),
      endTime: new Date(),
      answers: results,
      passed: score >= quiz.questions.length * 0.7
    });

    await result.save();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
