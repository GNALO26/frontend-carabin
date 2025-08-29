const User = require("../models/User");

const checkSubscription = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Vérifier si l'utilisateur a un abonnement actif
    const hasActiveSubscription = user.isSubscribed && 
                                 new Date() < new Date(user.subscriptionEnd);

    if (!hasActiveSubscription) {
      return res.status(403).json({ 
        error: "Accès réservé aux abonnés premium",
        message: "Vous devez souscrire à un abonnement pour accéder à ce contenu"
      });
    }

    next();
  } catch (err) {
    console.error("Erreur vérification abonnement:", err);
    res.status(500).json({ error: "Erreur serveur lors de la vérification de l'abonnement" });
  }
};

module.exports = checkSubscription;