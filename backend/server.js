require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/carabin_quiz';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ MongoDB error', err.message);
    process.exit(1);
  });

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/results', resultRoutes);

const path = require("path");

// Servir les fichiers du frontend
app.use(express.static(path.join(__dirname, "public")));

// ✅ Pour toutes les routes non-API → React
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Healthcheck (Render l’utilise pour savoir si ton app est en vie)
app.get('/health', (req, res) => res.json({ ok: true }));

// Middleware d’erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
