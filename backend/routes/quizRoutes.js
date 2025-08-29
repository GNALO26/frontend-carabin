const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const authMiddleware = require('../middlewares/authMiddleware');
const checkSubscription = require('../middlewares/checkSubscription');

// --- Nouvelle route : quiz "featured" ---
router.get('/featured', async (req, res) => {
  try {
    // Récupère les 6 derniers quiz (tu peux ajuster la logique)
    const featuredQuizzes = await Quiz.find().sort({ createdAt: -1 }).limit(6);
    res.json(featuredQuizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer les quiz' });
  }
});

// Récupérer les quiz par type (Gratuit / Premium)
router.get('/by-type', authMiddleware, async (req, res) => {
  try {
    const freeQuizzes = await Quiz.find({ free: true }, '_id title description duration category free questions');
    const premiumQuizzes = await Quiz.find({ free: false }, '_id title description duration category free questions');

    res.json({ free: freeQuizzes, premium: premiumQuizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Commencer un quiz
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });

    if (!quiz.free && !req.user.isSubscribed) {
      return res.status(403).json({ error: 'Abonnement requis pour accéder à ce quiz' });
    }

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
