const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Payment = require('../models/Payment');

// GET Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      activeSubscriptions: await Payment.countDocuments({ status: 'completed' }),
      totalQuizzes: await Quiz.countDocuments(),
      revenue: await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      recentPayments: await Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET All quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('title category difficulty createdAt');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET Single quiz
router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT Update quiz
router.put('/quizzes/:id', async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de mise à jour' });
  }
});

// DELETE Quiz
router.delete('/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur de suppression' });
  }
});

module.exports = router;