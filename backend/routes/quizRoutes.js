// Obtenir les quiz en vedette
router.get('/featured', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ free: true }).limit(3);
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const authMiddleware = require('../middlewares/authMiddleware');
const checkSubscription = require('../middlewares/checkSubscription');

// ✅ Quiz gratuit accessible à tous les utilisateurs connectés
router.get('/free', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find(
      { free: true },
      'title description duration category difficulty'
    );
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Quiz premium → seulement abonnés
router.get('/premium', authMiddleware, checkSubscription, async (req, res) => {
  try {
    const quizzes = await Quiz.find(
      { free: false },
      'title description duration category difficulty'
    );
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir tous les quiz (optionnel : mélange free + premium)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, 'title description duration category difficulty free');
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

    let score = 0;
    const detailedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index]?.selectedOption; // ✅ attend un objet {selectedOption, timeTaken}
      const isCorrect = question.correctAnswer === userAnswer;

      if (isCorrect) score++;

      detailedAnswers.push({
        questionId: question._id,
        selectedOption: userAnswer,
        isCorrect,
        timeTaken: answers[index]?.timeTaken || 0
      });
    });

    const percentage = (score / quiz.questions.length) * 100;
    const passed = quiz.passMark ? percentage >= quiz.passMark : true;

    const result = new Result({
      userId: req.user._id,
      quizId: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      startTime: new Date(startTime),
      endTime: new Date(),
      answers: detailedAnswers,
      percentage,
      passed
    });

    await result.save();

    res.json({
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      passed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
