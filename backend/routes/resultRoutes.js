const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const authMiddleware = require('../middlewares/authMiddleware');

// POST - Sauvegarder un résultat de quiz
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { quizId, score, totalQuestions, answers, timeTaken } = req.body;

    // Validation des données requises
    if (!quizId || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'Données manquantes pour sauvegarder le résultat' });
    }

    const result = new Result({
      userId: req.user._id,
      quizId,
      score,
      totalQuestions,
      answers: answers || [],
      timeTaken: timeTaken || 0,
      startTime: new Date(Date.now() - (timeTaken || 0) * 1000),
      endTime: new Date()
    });

    await result.save();
    
    // Populer les données pour la réponse
    await result.populate('quizId', 'title category');
    
    res.status(201).json({
      message: 'Résultat sauvegardé avec succès',
      result
    });
  } catch (error) {
    console.error('Erreur sauvegarde résultat:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la sauvegarde' });
  }
});

// Obtenir les résultats d'un utilisateur
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .populate('quizId', 'title category')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Erreur récupération résultats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir les résultats d'un quiz spécifique
router.get('/quiz/:quizId', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ 
      userId: req.user._id, 
      quizId: req.params.quizId 
    })
    .populate('quizId', 'title category')
    .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Erreur récupération résultats quiz:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir les statistiques globales
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await Result.aggregate([
      { $match: { userId: req.user._id } },
      { 
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
          totalTimeSpent: { $sum: "$timeTaken" }
        } 
      }
    ]);

    const defaultStats = { 
      totalQuizzes: 0, 
      averageScore: 0, 
      bestScore: 0, 
      totalTimeSpent: 0 
    };
    
    res.json(stats[0] || defaultStats);
  } catch (error) {
    console.error('Erreur calcul statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;