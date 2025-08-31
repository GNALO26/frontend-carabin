const Payment = require('../models/Payment');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { initiatePayment, verifyPayment } = require('../services/paymentService');
const { sendAccessCode } = require('../services/emailService');

exports.initiatePayment = async (req, res) => {
  try {
    const { amount, description, phone } = req.body;
    const user = req.user;

    // Validation du numéro de téléphone
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro de téléphone est requis'
      });
    }

    // Formater le numéro pour le Bénin (229)
    const formatPhoneNumber = (phone) => {
      const cleaned = phone.replace(/\D/g, '');
      
      // Si le numéro commence par 229, le retourner tel quel
      if (cleaned.startsWith('229')) {
        return cleaned;
      }
      
      // Si le numéro a 8 chiffres (format local Bénin: 01 XX XX XX)
      if (cleaned.length === 8 && cleaned.startsWith('01')) {
        return '229' + cleaned;
      }
      
      // Si le numéro a 9 chiffres et commence par 0 (format local: 0X XX XX XX XX)
      if (cleaned.length === 9 && cleaned.startsWith('0')) {
        return '229' + cleaned.substring(1);
      }
      
      // Si le numéro a 10 chiffres (format international sans +)
      if (cleaned.length === 10 && cleaned.startsWith('229')) {
        return cleaned;
      }
      
      return cleaned;
    };

    const formattedPhone = formatPhoneNumber(phone);

    // Initier le paiement avec CinetPay
    const paymentData = await initiatePayment({
      amount: amount || 5000,
      description: description || 'Abonnement Quiz de Carabin',
      userId: user._id.toString(),
      email: user.email,
      phone: formattedPhone,
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

    // Enregistrer l'activité de tentative de paiement
    const activity = new Activity({
      userId: user._id,
      type: 'payment_initiated',
      title: 'Tentative de paiement',
      description: `A initié un paiement de ${amount || 5000} FCFA pour l'abonnement premium`,
      data: {
        amount: amount || 5000,
        transactionId: paymentData.transaction_id
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
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const verification = await verifyPayment(transactionId);
    
    // Mettre à jour le statut du paiement
    const payment = await Payment.findOneAndUpdate(
      { transactionId },
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

      // Enregistrer l'activité de paiement réussi
      const activity = new Activity({
        userId: payment.userId,
        type: 'payment_success',
        title: 'Paiement réussi',
        description: `A souscrit à l'abonnement premium`,
        data: {
          amount: payment.amount,
          transactionId: payment.transactionId
        }
      });
      await activity.save();

      // Envoyer le code d'accès par email si nécessaire
      if (payment.accessCode) {
        await sendAccessCode(payment.email, payment.accessCode);
      }
    } else if (verification.status !== 'ACCEPTED' && payment) {
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
};

exports.handleNotification = async (req, res) => {
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
};

exports.getPaymentStatus = async (req, res) => {
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
};