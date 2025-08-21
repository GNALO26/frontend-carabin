require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import des routes
const authRoutes = require("./routes/authRoutes");
// 👉 Ajoute tes autres routes ici
// const quizRoutes = require("./routes/quizRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ================== Middleware ==================
app.use(
  cors({
    origin: [
      /\.netlify\.app$/, // autorise ton frontend Netlify
      "http://localhost:3000", // autorise ton dev local
    ],
    credentials: true,
  })
);

app.use(express.json());

// ================== Connexion MongoDB ==================
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => {
    console.error("❌ Erreur MongoDB:", err.message);
    process.exit(1);
  });

// ================== Routes API ==================
app.use("/api/auth", authRoutes);
// 👉 Ajoute les autres routes API ici
// app.use("/api/quiz", quizRoutes);
// app.use("/api/payment", paymentRoutes);

// ================== Healthcheck ==================
app.get("/api/health", (req, res) => {
  res.json({ message: "✅ API is running!" });
});

// ================== Démarrage Serveur ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});