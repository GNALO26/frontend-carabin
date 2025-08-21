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
    
    // Créer un enregistrement de paiement
    const paymentRecord = new Payment({
      userId: user._id,
      email: user.email,
      amount: amount || 5000,
      operator: 'CINETPAY',
      status: 'pending'
    });
    
    await paymentRecord.save();
    
    // Initier le paiement avec CinetPay
    const transactionId = 'TX' + Date.now();
    const paymentData = {
      amount: amount || 5000,
      transactionId,
      description: description || 'Abonnement Quiz de Carabin',
      customer_email: user.email,
      customer_id: user._id.toString()
    };
    
    const paymentResult = await initiatePayment(paymentData);
    
    // Mettre à jour l'enregistrement de paiement avec l'ID de transaction
    paymentRecord.transactionId = transactionId;
    await paymentRecord.save();
    
    res.json({
      payment_url: paymentResult.data.payment_url,
      payment_id: paymentRecord._id,
      transaction_id: transactionId
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vérifier un paiement
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { transactionId, paymentId } = req.body;
    
    if (!transactionId || !paymentId) {
      return res.status(400).json({ error: 'transactionId et paymentId requis' });
    }
    
    const result = await verifyPayment({ transactionId, paymentId });
    res.json(result);
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
    
    if (!transactionId || !paymentId) {
      return res.status(400).send('Paramètres manquants');
    }
    
    await verifyPayment({ transactionId, paymentId });
    res.status(200).send('OK');
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).send('ERROR');
  }
});

module.exports = router;