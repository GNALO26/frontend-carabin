const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');


// ... (routes existantes pour register/login)

// Valider un code d'accès
router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({ 
      'subscription.accessCode': code,
      'subscription.expiryDate': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    // Activer l'abonnement
    user.subscription.active = true;
    user.subscription.activatedAt = new Date();
    await user.save();

    // Générer un nouveau token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d' // 30 jours
    });

    res.json({ 
      success: true,
      token,
      expiryDate: user.subscription.expiryDate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Dans votre backend (routes/authRoutes.js)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Récupérer l'utilisateur avec ses relations
    const user = await User.findById(req.userId)
      .populate('subscription')
      .select('-password');
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;