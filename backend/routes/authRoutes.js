const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===================== REGISTER =====================
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    // Créer l'utilisateur
    const user = new User({
      email,
      password
    });

    await user.save();

    // Générer le token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé." });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe incorrect." });
    }

    // Générer le token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================== VALIDATE ACCESS CODE =====================
router.post("/validate-code", async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({
      "subscription.accessCode": code,
      "subscription.expiryDate": { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }

    // Activer l'abonnement
    user.subscription.active = true;
    user.subscription.activatedAt = new Date();
    await user.save();

    // Générer un nouveau token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      token,
      expiryDate: user.subscription.expiryDate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== GET CURRENT USER =====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
