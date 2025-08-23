const axios = require('axios');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendAccessCode } = require('./emailService'); // À décommenter si disponible

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2';

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function initiatePayment(paymentData) {
  try {
    const { amount, description, userId, email } = paymentData;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Enregistrer le paiement en attente
    const payment = new Payment({
      userId,
      email,
      amount,
      transactionId,
      paymentId: `pay_${transactionId}`,
      operator: 'OM', // Par défaut
      phoneNumber: '000000000', // À remplacer par les données réelles
      status: 'pending'
    });
    
    await payment.save();

    // Initier le paiement avec CinetPay
    const response = await axios.post(`${CINETPAY_BASE_URL}/payment`, {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: amount,
      currency: 'XOF',
      description: description,
      customer_id: userId.toString(),
      customer_name: email,
      customer_email: email,
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      notify_url: `${process.env.API_URL}/api/payment/notify`,
      channels: 'ALL'
    });

    return {
      ...response.data,
      paymentId: payment._id,
      transactionId: transactionId
    };
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'initialisation du paiement');
  }
}

async function verifyPayment(transactionId, paymentId) {
  try {
    // Vérifier le statut auprès de CinetPay
    const response = await axios.post(`${CINETPAY_BASE_URL}/payment/check`, {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId
    });

    const status = response?.data?.data?.status;
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new Error('Paiement introuvable');
    }

    if (status === 'ACCEPTED') {
      const code = generateAccessCode();
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

      // Mettre à jour le statut du paiement
      payment.status = 'completed';
      payment.accessCode = code;
      payment.accessExpiry = expiryDate;
      await payment.save();

      // Mettre à jour l'utilisateur
      const user = await User.findById(payment.userId);
      if (user) {
        user.subscription.isActive = true;
        user.subscription.expiryDate = expiryDate;
        user.subscription.accessCode = code;
        user.subscription.activatedAt = new Date();
        user.payments.push(payment._id);
        await user.save();

        // Créer un enregistrement d'abonnement
        await Subscription.create({
          userId: user._id,
          startDate: new Date(),
          expiryDate: expiryDate,
          accessCode: code,
          status: 'active'
        });

        // Envoyer l'email avec le code d'accès (à décommenter si disponible)
         if (user.email) {
           await sendAccessCode(user.email, code, expiryDate);
         }
      }

      return { 
        success: true, 
        status: 'completed',
        accessCode: code, 
        expiryDate: expiryDate 
      };
    } else {
      payment.status = 'failed';
      await payment.save();
      return { 
        success: false, 
        status: status || 'failed' 
      };
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erreur lors de la vérification du paiement');
  }
}

module.exports = { initiatePayment, verifyPayment };