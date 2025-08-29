const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../services/paymentService');
const Payment = require('../models/Payment');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

// Initier un paiement
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { amount, description, phone } = req.body;
    const user = req.user;

    const paymentData = await initiatePayment({
      amount: amount || 5000,
      description: description || 'Abonnement Quiz de Carabin',
      userId: user._id.toString(),
      email: user.email,
      phone: phone,
      customer_name: user.name
    });

    // Enregistrer le paiement en base de données
    const payment = new Payment({
      userId: user._id,
      email: user.email,
      amount: amount || 5000,
      description: description || 'Abonnement Quiz de Carabin',
      paymentId: paymentData.payment_id,
      transactionId: paymentData.transaction_id,
      status: 'pending'
    });

    await payment.save();
    
    res.json({
      success: true,
      payment_url: paymentData.payment_url,
      transaction_id: paymentData.transaction_id
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Vérifier un paiement
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.body;

    const verification = await verifyPayment(transactionId);
    
    // Mettre à jour le statut du paiement
    const payment = await Payment.findOneAndUpdate(
      { transactionId },
      { 
        status: verification.status === 'ACCEPTED' ? 'completed' : 'failed',
        operator: verification.data.operator_id,
        phoneNumber: verification.data.phone_number
      },
      { new: true }
    );

    // Si le paiement est accepté, mettre à jour l'utilisateur
    if (verification.status === 'ACCEPTED' && payment) {
      await User.findByIdAndUpdate(payment.userId, {
        isSubscribed: true,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      });
    }

    res.json({
      success: verification.status === 'ACCEPTED',
      status: verification.status,
      message: verification.message,
      payment: payment
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Webhook pour les notifications CinetPay
router.post('/notify', async (req, res) => {
  try {
    const { transaction_id, cpm_result } = req.body;

    if (transaction_id) {
      const verification = await verifyPayment(transaction_id);
      
      const payment = await Payment.findOneAndUpdate(
        { transactionId: transaction_id },
        { 
          status: verification.status === 'ACCEPTED' ? 'completed' : 'failed',
          operator: verification.data?.operator_id,
          phoneNumber: verification.data?.phone_number
        },
        { new: true }
      );

      // Si le paiement est accepté, mettre à jour l'utilisateur
      if (verification.status === 'ACCEPTED' && payment) {
        await User.findByIdAndUpdate(payment.userId, {
          isSubscribed: true,
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).send('ERROR');
  }
});

// Vérifier le statut d'abonnement de l'utilisateur
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      isSubscribed: user.isSubscribed,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      hasActiveSubscription: user.isSubscribed && new Date() < new Date(user.subscriptionEnd)
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;