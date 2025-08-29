require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import des routes
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// Middleware CORS
app.use(cors({
  origin: [
    'https://carabin-quiz.netlify.app',
    'https://philosophical-carp-quiz-de-carabin-14ca72a2.koyeb.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) return console.error('❌ Error listing collections:', err);
    console.log('📋 Collections disponibles:', collections.map(c => c.name));
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use("/api/quizzes", quizRoutes); // <-- IMPORTANT: correspond au frontend

// Healthcheck
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

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
