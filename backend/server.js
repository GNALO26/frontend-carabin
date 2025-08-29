require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import des routes
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware CORS amélioré
app.use(cors({
  origin: [
    'https://carabin-quiz.netlify.app', // Votre frontend Netlify
    'https://philosophical-carp-quiz-de-carabin-14ca72a2.koyeb.app', // Votre backend Koyeb
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging pour le débogage
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Connexion à MongoDB avec meilleure gestion d'erreurs
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  // Vérifier que les collections existent
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('❌ Error listing collections:', err);
      return;
    }
    console.log('📋 Collections disponibles:', collections.map(c => c.name));
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
// Endpoint racine de l'API
app.get("/api", (req, res) => {
  res.json({ 
    message: "✅ API Quiz de Carabin est opérationnelle!", 
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      quizzes: "/api/quizzes",
      payment: "/api/payment",
      results: "/api/results",
      admin: "/api/admin"
    },
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);

// Healthcheck amélioré
app.get("/api/health", (req, res) => {
  res.json({ 
    message: "✅ API is running!",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Gestion des routes non trouvées
app.all("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error("💥 Global error handler:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
