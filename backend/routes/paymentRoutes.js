const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../services/paymentService');
const Payment = require('../models/Payment');
const authMiddleware = require('../middlewares/authMiddleware');

// Initier un paiement
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = req.user;

    const paymentData = await initiatePayment({
      amount,
      description,
      userId: user._id,
      email: user.email
    });

    // Enregistrer le paiement en base de données
    const payment = new Payment({
      userId: user._id,
      amount,
      description,
      paymentId: paymentData.payment_id,
      transactionId: paymentData.transaction_id,
      status: 'pending'
    });

    await payment.save();
    res.json(paymentData);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vérifier un paiement
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { transactionId, paymentId } = req.body;

    const verification = await verifyPayment(transactionId, paymentId);
    
    // Mettre à jour le statut du paiement
    await Payment.findOneAndUpdate(
      { transactionId },
      { status: verification.status === 'ACCEPTED' ? 'completed' : 'failed' }
    );

    res.json(verification);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook pour les notifications CinetPay
router.post('/notify', async (req, res) => {
  try {
    const transactionId = req.body?.transaction_id || req.query?.transaction_id;
    const paymentId = req.body?.payment_id || req.query?.payment_id;

    if (transactionId && paymentId) {
      const verification = await verifyPayment(transactionId, paymentId);
      
      await Payment.findOneAndUpdate(
        { transactionId },
        { status: verification.status === 'ACCEPTED' ? 'completed' : 'failed' }
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).send('ERROR');
  }
});

module.exports = router;