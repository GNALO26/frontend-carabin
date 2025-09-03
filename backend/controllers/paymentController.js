const Payment = require('../models/Payment');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { initiatePayment, verifyPayment } = require('../services/paydunyaService');
const { sendAccessCode } = require('../services/emailService');

// Fonction pour générer un code d'accès unique
const generateUniqueAccessCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Vérifier si le code existe déjà
    const existingPayment = await Payment.findOne({ accessCode: code });
    if (!existingPayment) {
      isUnique = true;
    }
  }
  
  return code;
};

exports.initiatePayment = async (req, res) => {
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

    // Initier le paiement avec PayDunya
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
      paymentId: paymentData.token,
      transactionId: paymentData.token,
      status: 'pending',
      phoneNumber: formattedPhone,
      provider: 'paydunya'
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
        transactionId: paymentData.token,
        phone: formattedPhone,
        provider: 'paydunya'
      }
    });
    await activity.save();
    
    res.json({
      success: true,
      payment_url: paymentData.invoice_url,
      token: paymentData.token
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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token de paiement requis'
      });
    }

    const verification = await verifyPayment(token);
    
    // Adapter la réponse de PayDunya à votre format
    let status = 'pending';
    if (verification.status === 'completed') {
      status = 'completed';
    } else if (verification.status === 'cancelled') {
      status = 'failed';
    }

    // Mettre à jour le statut du paiement
    const payment = await Payment.findOneAndUpdate(
      { transactionId: token },
      { 
        status: status,
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
    if (status === 'completed') {
      // Générer un code d'accès unique
      const accessCode = await generateUniqueAccessCode();
      
      // Mettre à jour le paiement avec le code d'accès
      await Payment.findByIdAndUpdate(payment._id, {
        accessCode: accessCode,
        accessExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        isCodeUsed: false
      });

      // Envoyer le code d'accès par email
      await sendAccessCode(payment.email, accessCode, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      // Enregistrer l'activité de paiement réussi
      const activity = new Activity({
        userId: payment.userId,
        type: 'payment_success',
        title: 'Paiement réussi',
        description: `A souscrit à l'abonnement premium`,
        data: {
          amount: payment.amount,
          transactionId: payment.transactionId,
          provider: 'paydunya'
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
          reason: verification.response_text,
          provider: 'paydunya'
        }
      });
      await activity.save();
    }

    res.json({
      success: status === 'completed',
      status: status,
      message: verification.response_text,
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

// Utiliser un code d'accès
exports.useAccessCode = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    // Trouver le paiement avec ce code
    const payment = await Payment.findOne({ 
      accessCode: code,
      status: 'completed'
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Code d\'accès invalide'
      });
    }

    // Vérifier si le code a déjà été utilisé
    if (payment.isCodeUsed) {
      return res.status(400).json({
        success: false,
        error: 'Ce code a déjà été utilisé'
      });
    }

    // Vérifier si le code a expiré
    if (payment.accessExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Ce code a expiré'
      });
    }

    // Vérifier que l'utilisateur est bien le propriétaire du code
    if (payment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Ce code ne vous appartient pas'
      });
    }

    // Marquer le code comme utilisé
    await Payment.findByIdAndUpdate(payment._id, {
      isCodeUsed: true,
      usedAt: new Date(),
      status: 'used'
    });

    // Activer l'abonnement de l'utilisateur
    await User.findByIdAndUpdate(user._id, {
      isSubscribed: true,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    });

    // Enregistrer l'activité d'utilisation du code
    const activity = new Activity({
      userId: user._id,
      type: 'access_code_used',
      title: 'Code d\'accès utilisé',
      description: `A utilisé son code d'accès pour activer l'abonnement`,
      data: {
        code: code,
        paymentId: payment._id
      }
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Code validé avec succès. Votre abonnement est maintenant actif.'
    });
  } catch (error) {
    console.error('Use access code error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erreur lors de l\'utilisation du code'
    });
  }
};

// Webhook pour les notifications PayDunya
exports.handlePaydunyaWebhook = async (req, res) => {
  try {
    const signature = req.headers['paydunya-signature'];
    const payload = req.body;

    // Vérifier la signature pour s'assurer que la requête vient de PayDunya
    // Pour le moment, en mode test, on accepte toutes les requêtes sans vérification
    if (process.env.PAYDUNYA_MODE === 'live') {
      // Implémenter la vérification de signature ici pour le mode live
      console.warn('Vérification de signature non implémentée pour le mode live');
    }

    console.log('Notification reçue de PayDunya:', payload);

    // Traiter différentes notifications selon le type
    // PayDunya envoie généralement les données dans payload.data
    const token = payload.data?.token || payload.invoice?.token;

    if (token) {
      const verification = await verifyPayment(token);
      
      const payment = await Payment.findOneAndUpdate(
        { transactionId: token },
        { 
          status: verification.status === 'completed' ? 'completed' : 'failed',
          verifiedAt: new Date()
        },
        { new: true }
      );

      // Si le paiement est accepté, mettre à jour l'utilisateur
      if (verification.status === 'completed' && payment) {
        // Générer un code d'accès unique
        const accessCode = await generateUniqueAccessCode();
        
        // Mettre à jour le paiement avec le code d'accès
        await Payment.findByIdAndUpdate(payment._id, {
          accessCode: accessCode,
          accessExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          isCodeUsed: false
        });

        // Envoyer le code d'accès par email
        await sendAccessCode(payment.email, accessCode, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

        // Enregistrer l'activité de paiement réussi via webhook
        const activity = new Activity({
          userId: payment.userId,
          type: 'payment_success',
          title: 'Paiement réussi (webhook)',
          description: `A souscrit à l'abonnement premium via notification PayDunya`,
          data: {
            amount: payment.amount,
            transactionId: payment.transactionId,
            source: 'webhook',
            provider: 'paydunya'
          }
        });
        await activity.save();
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Paydunya webhook error:', error);
    res.status(500).send('ERROR');
  }
};

// Vérifier le statut d'abonnement de l'utilisateur
exports.getPaymentStatus = async (req, res) => {
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
};

// Obtenir l'historique des paiements
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};