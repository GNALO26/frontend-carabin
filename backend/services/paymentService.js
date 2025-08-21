const axios = require('axios');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendAccessCode } = require('./emailService');

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2';

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fonction pour initier un paiement
async function initiatePayment(paymentData) {
  try {
    const { amount, transactionId, description, customer_email, customer_id } = paymentData;
    
    const response = await axios.post(`${CINETPAY_BASE_URL}/payment`, {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: amount,
      currency: 'XOF',
      description: description,
      customer_id: customer_id,
      customer_name: customer_email,
      customer_email: customer_email,
      return_url: `${process.env.APP_URL}/payment-success`,
      notify_url: `${process.env.API_BASE_URL}/api/payment/notify`,
      channels: 'ALL'
    });

    return response.data;
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    throw new Error('Erreur lors de l\'initialisation du paiement');
  }
}

// Fonction pour vérifier un paiement
async function verifyPayment({ transactionId, paymentId }) {
  try {
    const response = await axios.post(`${CINETPAY_BASE_URL}/payment/check`, {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId
    });

    const status = response?.data?.data?.status;
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Paiement introuvable');

    if (status === 'ACCEPTED') {
      const code = generateAccessCode();
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

      payment.status = 'completed';
      payment.accessCode = code;
      payment.accessExpiry = expiry;
      await payment.save();

      // Récupération de l'utilisateur par email
      const user = await User.findOne({ email: payment.email });
      if (!user) throw new Error("Utilisateur introuvable pour ce paiement");

      // Création d'une souscription
      await Subscription.create({
        userId: user._id,
        startDate: new Date(),
        expiryDate: expiry,
        accessCode: code
      });

      // Associer le paiement à l'utilisateur
      user.payments.push(payment._id);
      await user.save();

      // Envoi du code d'accès par email
      if (user.email) {
        await sendAccessCode(user.email, code, expiry);
      }

      return { success: true, accessCode: code, expiryDate: expiry };
    } else {
      payment.status = 'failed';
      await payment.save();
      return { success: false, status };
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    throw new Error('Erreur lors de la vérification du paiement');
  }
}

module.exports = { initiatePayment, verifyPayment };