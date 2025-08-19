const express = require('express');
const router = express.Router();
const MobilePaymentService = require('../services/mobilePayment');
const { verifyPayment } = require('../services/paymentService');

// Démarre le paiement → renvoie paymentUrl + paymentId + instructions
router.post('/initiate', async (req, res) => {
  try {
    const out = await MobilePaymentService.initiatePayment(req.body);
    res.json(out);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Vérifie et finalise (à appeler après retour de CinetPay)
router.post('/confirm', async (req, res) => {
  try {
    const { transactionId, paymentId } = req.body;
    if (!transactionId || !paymentId) {
      return res.status(400).json({ error: 'transactionId et paymentId requis' });
    }
    const result = await verifyPayment({ transactionId, paymentId });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Callback (optionnel) si tu utilises notify_url côté CinetPay
router.post('/callback', async (req, res) => {
  try {
    const transactionId = req.body?.transaction_id || req.query?.transaction_id;
    const paymentId = req.body?.payment_id || req.query?.payment_id;
    if (!transactionId || !paymentId) return res.status(400).send('missing ids');
    await verifyPayment({ transactionId, paymentId });
    res.status(200).send('ok');
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

module.exports = router;