const Payment = require('../models/Payment');
const { initiatePayment, verifyPayment } = require('../services/paymentService');
const { sendAccessCode } = require('../services/emailService');

exports.initiatePayment = async (req, res) => {
  const { amount, email } = req.body;
  
  // Créer un ID de commande unique
  const orderId = 'CMD-${Date.now()}-${Math.floor(Math.random() * 1000)}';
  
  try {
    // Créer enregistrement dans la base
    const paymentRecord = new Payment({
      user: req.userId,
      amount,
      orderId,
      status: 'pending'
    });
    await paymentRecord.save();
    // Extrait pour controller : backend/controllers/paymentController.js
const Payment = require('../models/Payment');
const { initiatePayment: svcInitiate, verifyPayment: svcVerify } = require('../services/paymentService');
const { sendAccessCode } = require('../services/emailService');

exports.initiatePayment = async (req, res) => {
  try {
    const { operator, phoneNumber, amount } = req.body;
    const userId = req.userId || req.body.userId; // selon comment tu gères l'auth
    const { transactionId, instructions, paymentId } = await svcInitiate({ operator, phoneNumber, amount, userId });
    return res.json({ transactionId, instructions, paymentId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Impossible d\'initier le paiement' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const result = await svcVerify(transactionId);
    if (result.status === 'success') {
      // envoyer le code d'accès par email si present
      if (result.payment && result.payment.accessCode && result.payment.user) {
        const user = await User.findById(result.payment.user);
        if (user) {
          await sendAccessCode(user.email, result.payment.accessCode);
        }
      }
    }
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur de vérification du paiement' });
  }
};

/*

    // Initier paiement avec PaiementPro
    const paymentInit = await initiatePayment({
      amount,
      orderId,
      customerEmail: email,
      returnUrl: 'https://votredomaine.com/payment/success',
      cancelUrl: 'https://votredomaine.com/payment/cancel'
    });

    res.json({ 
      paymentUrl: paymentInit.payment_url,
      paymentId: paymentRecord._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleCallback = async (req, res) => {
  const { transaction_id, status } = req.query;
  
  try {
    // Vérifier le statut avec PaiementPro
    const verification = await verifyPayment(transaction_id);
    
    if (verification.status === 'success') {
      const payment = await Payment.findById(req.query.payment_id);
      
      // Générer code d'accès
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Mettre à jour le paiement
      payment.status = 'completed';
      payment.transactionId = transaction_id;
      payment.accessCode = accessCode;
      await payment.save();
      
      // Envoyer le code par email
      await sendAccessCode(payment.user.email, accessCode);
      
      return res.redirect('/payment/success');
    }*/
    
    res.redirect('/payment/failed');
  } catch (error) {
    res.status(500).redirect('/payment/error');
  }
};