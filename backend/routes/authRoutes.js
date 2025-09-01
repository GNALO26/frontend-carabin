const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// ===================== REGISTER =====================
router.post("/register", authController.userRegister);

// ===================== LOGIN =====================
router.post("/login", authController.userLogin);

// ===================== VALIDATE ACCESS CODE =====================
router.post("/validate-access-code", authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    
    // Utilisation de req.user._id
    const user = await User.findOne({
      _id: req.user._id,
      "subscription.accessCode": code,
      "subscription.expiryDate": { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }

    // Activer l'abonnement
    user.subscription.isActive = true;
    user.subscription.activatedAt = new Date();
    await user.save();

    // Générer un nouveau token avec la nouvelle session
    const sessionId = uuidv4();
    user.currentSessionId = sessionId;
    await user.save();
    
    const token = jwt.sign(
      { 
        userId: user._id,
        sessionId: sessionId
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      expiryDate: user.subscription.expiryDate,
    });
  } catch (error) {
    console.error("💥 Erreur validation code:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===================== GET CURRENT USER =====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Utilisation de req.user directement (déjà peuplé par le middleware)
    const user = req.user;
    
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSubscribed: user.isSubscribed,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        currentSessionId: user.currentSessionId,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("💥 Erreur récupération utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ===================== LOGOUT =====================
router.post("/logout", authMiddleware, authController.logout);

// ===================== LOGOUT ALL DEVICES =====================
router.post("/logout-all", authMiddleware, authController.logoutAllDevices);

module.exports = router;