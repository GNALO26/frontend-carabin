const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

// ===================== REGISTER =====================
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Tentative d'inscription:", req.body);
    
    const { name, email, password } = req.body; // Ajout du champ name

    // Validation des données
    if (!name || !email || !password) {
      console.log("❌ Données manquantes");
      return res.status(400).json({ error: "Nom, email et mot de passe requis." });
    }

    if (password.length < 6) {
      console.log("❌ Mot de passe trop court");
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email déjà utilisé:", email);
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    // Créer l'utilisateur avec le nom
    const user = new User({
      name, // Ajout du nom
      email,
      password
    });

    await user.save();
    console.log("✅ Utilisateur créé:", user.email);

    // Générer le token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    console.log("🎟 Token généré pour:", user.email);

    res.status(201).json({
      token,
      user: { 
        id: user._id,
        name: user.name, // Inclure le nom dans la réponse
        email: user.email 
      },
      message: "Inscription réussie!"
    });

  } catch (error) {
    console.error("💥 Erreur serveur lors de l'inscription:", error);
    
    // Erreur de duplication MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }
    
    res.status(500).json({ 
      error: "Erreur serveur lors de l'inscription.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Tentative de connexion:", req.body);
    
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Utilisateur non trouvé:", email);
      return res.status(400).json({ error: "Utilisateur non trouvé." });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("❌ Mot de passe incorrect pour:", email);
      return res.status(400).json({ error: "Mot de passe incorrect." });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer le token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log("✅ Connexion réussie pour:", user.email);

    res.json({
      token,
      user: { 
        id: user._id,
        name: user.name, // Inclure le nom dans la réponse
        email: user.email,
        subscription: user.subscription
      },
    });
  } catch (error) {
    console.error("💥 Erreur serveur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================== VALIDATE ACCESS CODE =====================
router.post("/validate-code", authMiddleware, async (req, res) => {
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
    user.subscription.isActive = true;
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
    console.error("💥 Erreur validation code:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===================== GET CURRENT USER =====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.json({ 
      user: {
        id: user._id,
        name: user.name, // Inclure le nom dans la réponse
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error("💥 Erreur récupération utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;