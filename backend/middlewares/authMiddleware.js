const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé.' });
    }

    req.user = user; // Définit l'utilisateur complet
    req.userId = user._id; // Définit également l'ID de l'utilisateur pour compatibilité
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

module.exports = authMiddleware;