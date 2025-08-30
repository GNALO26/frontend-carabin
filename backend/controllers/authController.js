const Admin = require('../models/Admin');
const User = require('../models/User');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');

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
    
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET_ADMIN,
      { expiresIn: '8h' }
    );
    
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
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ajoutez également des activités pour les connexions utilisateur normales
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Enregistrer l'activité de connexion utilisateur
    const activity = new Activity({
      userId: user._id,
      type: 'user_login',
      title: 'Connexion utilisateur',
      description: `Utilisateur ${email} connecté`,
      data: {
        email: email
      }
    });
    await activity.save();
    
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};