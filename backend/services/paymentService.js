const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2';

// Fonction pour initier un paiement
const initiatePayment = async (paymentData) => {
  try {
    const transaction_id = uuidv4();

    const payload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transaction_id,
      amount: paymentData.amount,
      currency: paymentData.currency || 'XOF',
      description: paymentData.description || 'Abonnement Quiz de Carabin',
      customer_id: paymentData.userId,
      customer_name: paymentData.customer_name || 'Client Quiz de Carabin',
      customer_email: paymentData.email,
      customer_phone_number: paymentData.phone || '',
      return_url: `${process.env.APP_URL}`/payment-success,
      notify_url: `${process.env.API_BASE_URL}`/api/payment/notify,
      channels: 'ALL',
      metadata: JSON.stringify({ userId: paymentData.userId })
    };

    // CORRECTION: Suppression de la virgule mal placée
    const response = await axios.post(`${CINETPAY_BASE_URL}`/payment/init, payload);

    if (response.data.code === '201') {
      return {
        payment_id: response.data.data.payment_id,
        transaction_id: transaction_id,
        payment_url: response.data.data.payment_url
      };
    } else {
      throw new Error(response.data.message || 'Erreur lors de l\'initialisation du paiement');
    }
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'initialisation du paiement');
  }
};

// Fonction pour vérifier un paiement
const verifyPayment = async (transactionId) => {
  try {
    const payload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId
    };

    // CORRECTION: Suppression de la virgule mal placée
    const response = await axios.post(`${CINETPAY_BASE_URL}`/payment/check, payload);

    if (response.data.code === '00') {
      return {
        status: 'ACCEPTED',
        message: 'Paiement effectué avec succès',
        data: response.data.data
      };
    } else {
      return {
        status: 'REJECTED',
        message: response.data.message,
        data: response.data.data
      };
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erreur lors de la vérification du paiement');
  }
};

module.exports = {
  initiatePayment,
  verifyPayment
};