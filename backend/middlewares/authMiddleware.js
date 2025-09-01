const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant.' });
    }

    // Décoder le token pour obtenir les informations de base
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Essayer avec le secret admin si le premier échoue
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
      } catch (adminErr) {
        return res.status(401).json({ error: 'Token invalide.' });
      }
    }

    // Trouver l'utilisateur selon le rôle
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé.' });
    }

    // Vérifier si le compte est actif (pour les utilisateurs normaux)
    if (decoded.role !== 'admin' && !user.isActive) {
      return res.status(401).json({ error: 'Ce compte a été désactivé.' });
    }

    // Vérifier la session (connexion unique)
    if (!user.currentSessionId || user.currentSessionId !== decoded.sessionId) {
      return res.status(401).json({ 
        error: 'Session invalide. Veuillez vous reconnecter.',
        code: 'SESSION_EXPIRED'
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token invalide.' });
  }
};

module.exports = authMiddleware;