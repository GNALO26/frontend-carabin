const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../services/paymentService');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Activity = require('../models/Activity');
const authMiddleware = require('../middlewares/authMiddleware');

// Initier un paiement
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { amount, description, phone } = req.body;
    const user = req.user;

    // Validation des données requises
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro de téléphone est requis'
      });
    }

    // Nettoyer et valider le format du numéro de téléphone pour le Bénin
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Validation spécifique pour les numéros béninois
    let formattedPhone;
    
    if (cleanedPhone.startsWith('229') && cleanedPhone.length === 11) {
      // Format déjà correct: 229 + 8 chiffres = 11 chiffres
      formattedPhone = cleanedPhone;
    } else if (cleanedPhone.length === 8 && cleanedPhone.startsWith('01')) {
      // Format local: 8 chiffres commençant par 01 (ex: 01234567)
      formattedPhone = '229' + cleanedPhone;
    } else if (cleanedPhone.length === 9 && cleanedPhone.startsWith('0')) {
      // Format local avec 0: 9 chiffres commençant par 0 (ex: 001234567)
      formattedPhone = '229' + cleanedPhone.substring(1);
    } else {
      // Format non reconnu
      return res.status(400).json({
        success: false,
        error: 'Format de numéro invalide. Utilisez le format: 22901234567 ou 01234567'
      });
    }

    // Validation finale: doit être exactement 229 + 8 chiffres = 11 chiffres
    if (!formattedPhone.match(/^229[0-9]{8}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Format de numéro invalide. Le numéro doit avoir 11 chiffres: 229 + 8 chiffres'
      });
    }

    console.log('Tentative de paiement avec le numéro:', formattedPhone);

    // Initier le paiement avec CinetPay
    const paymentData = await initiatePayment({
      amount: amount || 5000,
      description: description || 'Abonnement Quiz de Carabin Premium',
      userId: user._id.toString(),
      email: user.email,
      phone: formattedPhone,
      customer_name: user.name || 'Client Quiz de Carabin'
    });

    // Enregistrer le paiement en base de données
    const payment = new Payment({
      userId: user._id,
      email: user.email,
      amount: amount || 5000,
      description: description || 'Abonnement Quiz de Carabin Premium',
      paymentId: paymentData.payment_id,
      transactionId: paymentData.transaction_id,
      status: 'pending',
      phoneNumber: formattedPhone
    });

    await payment.save();

    // Enregistrer l'activité de tentative de paiement
    const activity = new Activity({
      userId: user._id,
      type: 'payment_initiated',
      title: 'Tentative de paiement',
      description: `A initié un paiement de ${amount || 5000} FCFA pour l'abonnement premium`,
      data: {
        amount: amount || 5000,
        transactionId: paymentData.transaction_id,
        phone: formattedPhone
      }
    });
    await activity.save();
    
    res.json({
      success: true,
      payment_url: paymentData.payment_url,
      transaction_id: paymentData.transaction_id
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erreur lors de l\'initialisation du paiement'
    });
  }
});

// Vérifier un paiement
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'ID de transaction requis'
      });
    }

    const verification = await verifyPayment(transactionId);
    
    // Mettre à jour le statut du paiement
    const payment = await Payment.findOneAndUpdate(
      { transactionId },
      { 
        status: verification.status === 'ACCEPTED' ? 'completed' : 'failed',
        operator: verification.data?.operator_id,
        phoneNumber: verification.data?.phone_number,
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Paiement non trouvé'
      });
    }

    // Si le paiement est accepté, mettre à jour l'utilisateur
    if (verification.status === 'ACCEPTED') {
      await User.findByIdAndUpdate(payment.userId, {
        isSubscribed: true,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      });

      // Enregistrer l'activité de paiement réussi
      const activity = new Activity({
        userId: payment.userId,
        type: 'payment_success',
        title: 'Paiement réussi',
        description: `A souscrit à l'abonnement premium`,
        data: {
          amount: payment.amount,
          transactionId: payment.transactionId,
          operator: verification.data?.operator_id
        }
      });
      await activity.save();
    } else {
      // Enregistrer l'activité de paiement échoué
      const activity = new Activity({
        userId: payment.userId,
        type: 'payment_failed',
        title: 'Paiement échoué',
        description: `Tentative de paiement échouée pour l'abonnement premium`,
        data: {
          amount: payment.amount,
          transactionId: payment.transactionId,
          reason: verification.message
        }
      });
      await activity.save();
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
      error: error.message || 'Erreur lors de la vérification du paiement'
    });
  }
});

// Webhook pour les notifications CinetPay
router.post('/notify', async (req, res) => {
  try {
    const { transaction_id, cpm_result, cpm_signature } = req.body;

    console.log('Notification reçue de CinetPay:', {
      transaction_id,
      cpm_result,
      cpm_signature
    });

    if (transaction_id) {
      const verification = await verifyPayment(transaction_id);
      
      const payment = await Payment.findOneAndUpdate(
        { transactionId: transaction_id },
        { 
          status: verification.status === 'ACCEPTED' ? 'completed' : 'failed',
          operator: verification.data?.operator_id,
          phoneNumber: verification.data?.phone_number,
          verifiedAt: new Date()
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

        // Enregistrer l'activité de paiement réussi via webhook
        const activity = new Activity({
          userId: payment.userId,
          type: 'payment_success',
          title: 'Paiement réussi (webhook)',
          description: `A souscrit à l'abonnement premium via notification`,
          data: {
            amount: payment.amount,
            transactionId: payment.transactionId,
            source: 'webhook'
          }
        });
        await activity.save();
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
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
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

// Obtenir l'historique des paiements
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;