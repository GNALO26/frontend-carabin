const axios = require('axios');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendAccessCode } = require('./emailService');

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_CHECK_URL = 'https://api-checkout.cinetpay.com/v2/payment/check';

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function verifyPayment({ transactionId, paymentId }) {
  const resp = await axios.post(CINETPAY_CHECK_URL, {
    apikey: CINETPAY_API_KEY,
    site_id: CINETPAY_SITE_ID,
    transaction_id: transactionId
  });

  const status = resp?.data?.data?.status;
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Paiement introuvable');

  if (status === 'ACCEPTED') {
    const code = generateAccessCode();
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    payment.status = 'completed';
    payment.accessCode = code;
    payment.accessExpiry = expiry;
    await payment.save();

    // Récupération de l’utilisateur par email
    const user = await User.findOne({ email: payment.email });
    if (!user) throw new Error("Utilisateur introuvable pour ce paiement");

    // Création d’une souscription
    await Subscription.create({
      userId: user._id,
      startDate: new Date(),
      expiryDate: expiry,
      accessCode: code
    });

    // Associer le paiement à l’utilisateur
    user.payments.push(payment._id);
    await user.save();

    // Envoi du code d’accès par email
    if (user.email) {
      await sendAccessCode(user.email, code, expiry);
    }

    return { success: true, accessCode: code, expiryDate: expiry };
  } else {
    payment.status = 'failed';
    await payment.save();
    return { success: false, status };
  }
}

module.exports = { verifyPayment };