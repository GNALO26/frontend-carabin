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
const activityRoutes = require("./routes/activities");

const app = express();

// Middleware CORS amélioré
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://carabin-quiz.netlify.app',
      'https://philosophical-carp-quiz-de-carabin-14ca72a2.koyeb.app',
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging pour le débogage (seulement en développement)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
}

// Connexion à MongoDB avec meilleure gestion d'erreurs
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Vérifier que les collections existent
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections disponibles:', collections.map(c => c.name));
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Gestion de la déconnexion MongoDB
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Endpoint racine de l'API
app.get("/api", (req, res) => {
  res.json({ 
    message: "✅ API Quiz de Carabin est opérationnelle!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: "/api/auth",
      quizzes: "/api/quizzes",
      payment: "/api/payment",
      results: "/api/results",
      admin: "/api/admin",
      activities: "/api/activities"
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
app.use("/api/activities", activityRoutes);

// Healthcheck amélioré
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let dbStatusText;
  
  switch(dbStatus) {
    case 0: dbStatusText = "Disconnected"; break;
    case 1: dbStatusText = "Connected"; break;
    case 2: dbStatusText = "Connecting"; break;
    case 3: dbStatusText = "Disconnecting"; break;
    default: dbStatusText = "Unknown";
  }
  
  res.json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    database: dbStatusText,
    uptime: process.uptime()
  });
});

// Gestion des routes non trouvées
app.all("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error("💥 Global error handler:", err);
  
  // Erreur CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: "Accès interdit par la politique CORS"
    });
  }
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: "Erreur de validation",
      details: errors
    });
  }
  
  // Erreur de duplication Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: "Doublon détecté",
      message: `${field} existe déjà`
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: "Token invalide"
    });
  }
  
  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: "Token expiré"
    });
  }
  
  // Erreur par défaut
  res.status(err.status || 500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV !== "production" ? err.message : undefined,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});

// Gestion des signaux d'arrêt
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT. Closing server gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM. Closing server gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
});

// Gestion des erreurs non attrapées
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;