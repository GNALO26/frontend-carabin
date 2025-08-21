const User = require("../models/User");

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (!user.hasPremiumAccess()) {
      return res.status(403).json({ error: "Accès réservé aux abonnés premium" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = checkSubscription;