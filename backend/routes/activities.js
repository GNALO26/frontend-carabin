const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authMiddleware = require('../middlewares/authMiddleware');

// Récupérer les activités d'un utilisateur
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(activities);
  } catch (error) {
    console.error('Erreur récupération activités:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une activité
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, title, description, data } = req.body;
    
    const activity = new Activity({
      userId: req.user._id,
      type,
      title,
      description,
      data
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Erreur création activité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;