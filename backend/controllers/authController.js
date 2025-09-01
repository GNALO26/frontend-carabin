const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Activity = require('../models/Activity');

// Fonction pour générer un token avec ID de session
const generateAuthToken = (user, sessionId) => {
  return jwt.sign(
    { 
      userId: user._id.toString(),
      sessionId: sessionId,
      role: user.role
    },
    user.role === 'admin' ? process.env.JWT_SECRET_ADMIN : process.env.JWT_SECRET,
    { expiresIn: user.role === 'admin' ? '8h' : '24h' }
  );
};

// Login administrateur
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Créer une nouvelle session
    const sessionId = uuidv4();
    admin.currentSessionId = sessionId;
    admin.lastLogin = new Date();
    admin.loginCount += 1;
    await admin.save();
    
    const token = generateAuthToken(admin, sessionId);
    
    // Enregistrer l'activité de connexion admin
    const activity = new Activity({
      userId: admin._id,
      type: 'admin_login',
      title: 'Connexion administrateur',
      description: `Administrateur ${username} connecté`,
      data: {
        username: username,
        role: 'admin'
      }
    });
    await activity.save();
    
    res.json({ 
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login utilisateur
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({ error: 'Ce compte a été désactivé' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Créer une nouvelle session (invalide les sessions précédentes)
    const sessionId = uuidv4();
    user.currentSessionId = sessionId;
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
    
    const token = generateAuthToken(user, sessionId);
    
    // Enregistrer l'activité de connexion utilisateur
    const activity = new Activity({
      userId: user._id,
      type: 'user_login',
      title: 'Connexion utilisateur',
      description: `Utilisateur ${email} connecté`,
      data: {
        email: email,
        sessionId: sessionId
      }
    });
    await activity.save();
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSubscribed: user.isSubscribed,
        subscriptionEnd: user.subscriptionEnd,
        role: user.role
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Inscription utilisateur
exports.userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Créer le nouvel utilisateur
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Créer une session pour le nouvel utilisateur
    const sessionId = uuidv4();
    user.currentSessionId = sessionId;
    user.lastLogin = new Date();
    user.loginCount = 1;
    await user.save();
    
    const token = generateAuthToken(user, sessionId);
    
    // Enregistrer l'activité d'inscription
    const activity = new Activity({
      userId: user._id,
      type: 'user_register',
      title: 'Inscription utilisateur',
      description: `Nouvel utilisateur ${email} inscrit`,
      data: {
        email: email,
        name: name
      }
    });
    await activity.save();
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSubscribed: user.isSubscribed,
        role: user.role
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Déconnexion
exports.logout = async (req, res) => {
  try {
    const user = req.user;
    
    // Invalider la session actuelle
    user.currentSessionId = null;
    await user.save();
    
    // Enregistrer l'activité de déconnexion
    const activity = new Activity({
      userId: user._id,
      type: user.role === 'admin' ? 'admin_logout' : 'user_logout',
      title: user.role === 'admin' ? 'Déconnexion administrateur' : 'Déconnexion utilisateur',
      description: `${user.role === 'admin' ? 'Administrateur' : 'Utilisateur'} ${user.email} déconnecté`,
      data: {
        email: user.email,
        role: user.role
      }
    });
    await activity.save();
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Déconnexion de tous les appareils
exports.logoutAllDevices = async (req, res) => {
  try {
    const user = req.user;
    
    // Invalider toutes les sessions
    user.currentSessionId = null;
    await user.save();
    
    // Enregistrer l'activité
    const activity = new Activity({
      userId: user._id,
      type: 'logout_all_devices',
      title: 'Déconnexion de tous les appareils',
      description: `Toutes les sessions de ${user.email} ont été invalidées`,
      data: {
        email: user.email,
        role: user.role
      }
    });
    await activity.save();
    
    res.json({ message: 'Toutes les sessions ont été invalidées' });
  } catch (error) {
    console.error('Logout all devices error:', error);
    res.status(500).json({ error: error.message });
  }
};