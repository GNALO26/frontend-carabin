const express = require("express");
const router = express.Router();

// Import des routes
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Centralisation des routes
router.use("/auth", authRoutes);
router.use("/quizzes", quizRoutes);
router.use("/payment", paymentRoutes);
router.use("/results", resultRoutes);
router.use("/admin", adminRoutes);

module.exports = router;