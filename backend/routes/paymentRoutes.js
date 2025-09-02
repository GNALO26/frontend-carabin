const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
// Ajoutez cette route
router.post('/initiate-payment', authMiddleware, paymentController.initiatePayment);

// Initier un paiement avec PayDunya
router.post('/initiate', authMiddleware, paymentController.initiatePayment);

// Vérifier un paiement PayDunya
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// Utiliser un code d'accès
router.post('/use-access-code', authMiddleware, paymentController.useAccessCode);

// Webhook pour les notifications PayDunya
router.post('/paydunya-webhook', paymentController.handlePaydunyaWebhook);

// Vérifier le statut d'abonnement de l'utilisateur
router.get('/status', authMiddleware, paymentController.getPaymentStatus);

// Obtenir l'historique des paiements
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

module.exports = router;