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
    
    // Validation des champs requis
    if (!type || !title || !description) {
      return res.status(400).json({ error: 'Type, titre et description sont requis' });
    }
    
    const activity = new Activity({
      userId: req.user._id,
      type,
      title,
      description,
      data: data || {}
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Erreur création activité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une activité
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    
    res.json({ message: 'Activité supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression activité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;