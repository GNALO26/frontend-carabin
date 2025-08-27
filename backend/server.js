require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const router = require("./apiRouter"); // Import du nouveau nom de fichier

const app = express();

// Middleware CORS
app.use(cors({
origin: [
"https://carabin-quiz.netlify.app",
"https://carabin-quiz-backend.onrender.com",
"http://localhost:3000",
"http://localhost:5000"
],
credentials: true,
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middlewares parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
if (req.body && Object.keys(req.body).length > 0) {
console.log("Request Body:", JSON.stringify(req.body, null, 2));
}
next();
});

// Connexion MongoDB (simplifiée sans options dépréciées)
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
console.error("❌ MongoDB connection error:", err);
process.exit(1);
});

// Routes
app.use("/api", router);

// Healthcheck
app.get("/api/health", (req, res) => {
res.json({
message: "✅ API is running!",
timestamp: new Date().toISOString(),
database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
});
});

// 404
app.all("*", (req, res) => {
res.status(404).json({ error: "Route not found" });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
console.error("💥 Global error handler:", err);
res.status(500).json({
error: "Internal server error",
message: process.env.NODE_ENV === "development" ? err.message : undefined
});
});

// Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`🚀 Serveur démarré sur le port ${PORT}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});