const axios = require('axios');
require('dotenv').config();

const merchantId = process.env.PAYMENT_PRO_MERCHANT_ID;
const apiKey = process.env.PAYMENT_PRO_API_KEY;
const baseURL = process.env.PAYMENT_PRO_BASE_URL;

const paymentPro = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey}'
  }
});

exports.initiatePayment = async (paymentData) => {
  const { amount, currency, orderId, customerEmail, returnUrl, cancelUrl } = paymentData;

  try {
    const response = await paymentPro.post('/payment/initiate', {
      merchant_id: merchantId,
      amount,
      currency,
      order_id: orderId,
      customer_email: customerEmail,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      // Ajoutez d'autres paramètres nécessaires selon la documentation PaiementPro
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'initiation du paiement:', error.response.data);
    throw new Error('Échec de l\'initiation du paiement');
  }
};

exports.verifyPayment = async (transactionId) => {
  try {
    const response = await paymentPro.get('/payment/verify/${transactionId}', {
      params: { merchant_id: merchantId }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error.response.data);
    throw new Error('Échec de la vérification du paiement');
  }
};