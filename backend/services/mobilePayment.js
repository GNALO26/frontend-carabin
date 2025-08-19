const axios = require('axios');
const operators = require('../config/operators');
const Payment = require('../models/Payment');

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_PAYMENT_URL = 'https://api-checkout.cinetpay.com/v2/payment';
const PRICE = 5000;

function formatSteps(steps, amount) {
  return steps.map(s => s.replace('{amount}', String(amount)));
}

class MobilePaymentService {
  static async initiatePayment({ operator, phoneNumber, email }) {
    if (!operator || !phoneNumber || !email) {
      throw new Error('operator, phoneNumber et email sont requis');
    }
    const opKey = String(operator).toLowerCase();
    const op = operators[opKey];
    if (!op) throw new Error('Opérateur non supporté');

    const transactionId = `TX-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    // Sauvegarde initiale (pending)
    const payment = await Payment.create({
      email,
      operator: opKey,
      phoneNumber,
      amount: PRICE,
      status: 'pending',
      transactionId,
      provider: 'cinetpay'
    });

    // Appel CinetPay
    const payload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: PRICE,
      currency: 'XOF',
      description: 'Abonnement 30 jours — Quiz de Carabin',
      return_url: process.env.APP_URL ? `${process.env.APP_URL}/payment/success` : 'https://example.com/payment/success',
      notify_url: process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api/payment/callback` : 'https://example.com/api/payment/callback',
      customer_email: email,
      customer_phone_number: phoneNumber
    };

    const resp = await axios.post(CINETPAY_PAYMENT_URL, payload);
    if (!resp.data || !resp.data.data || !resp.data.data.payment_url) {
      throw new Error(resp.data?.message || 'Erreur CinetPay');
    }

    return {
      paymentId: payment._id,
      transactionId,
      paymentUrl: resp.data.data.payment_url,
      instructions: formatSteps(op.paymentSteps, PRICE),
      merchantNumber: op.merchantNumber,
      amount: PRICE
    };
  }
}

module.exports = MobilePaymentService;