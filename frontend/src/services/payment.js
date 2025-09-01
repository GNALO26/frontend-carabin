import API from './api';

export const paymentService = {
  initiatePayment: async (paymentData) => {
    try {
      const response = await API.post('/payment/initiate', {
        amount: paymentData.amount || 5000,
        description: paymentData.description || 'Abonnement Quiz de Carabin Premium',
        phone: paymentData.phone
      });

      return {
        success: response.data.success,
        payment_url: response.data.payment_url,
        token: response.data.token,
        error: null
      };
    } catch (error) {
      console.error('Erreur initiation paiement:', error);
      return {
        success: false,
        payment_url: null,
        token: null,
        error: error.response?.data?.error || error.message || 'Erreur lors de l\'initialisation du paiement'
      };
    }
  },

  verifyPayment: async (token) => {
    try {
      const response = await API.post('/payment/verify', {
        token: token
      });

      return {
        success: response.data.success,
        status: response.data.status,
        message: response.data.message,
        payment: response.data.payment,
        error: null
      };
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      return {
        success: false,
        status: 'ERROR',
        message: null,
        payment: null,
        error: error.response?.data?.error || error.message || 'Erreur lors de la vérification du paiement'
      };
    }
  },

  useAccessCode: async (code) => {
    try {
      const response = await API.post('/payment/use-access-code', {
        code: code
      });

      return {
        success: response.data.success,
        message: response.data.message,
        error: null
      };
    } catch (error) {
      console.error('Erreur utilisation code:', error);
      return {
        success: false,
        message: null,
        error: error.response?.data?.error || error.message || 'Erreur lors de l\'utilisation du code'
      };
    }
  },

  getSubscriptionStatus: async () => {
    try {
      const response = await API.get('/payment/status');
      return {
        success: true,
        isSubscribed: response.data.isSubscribed,
        subscriptionStart: response.data.subscriptionStart,
        subscriptionEnd: response.data.subscriptionEnd,
        hasActiveSubscription: response.data.hasActiveSubscription,
        error: null
      };
    } catch (error) {
      console.error('Erreur statut abonnement:', error);
      return {
        success: false,
        isSubscribed: false,
        subscriptionStart: null,
        subscriptionEnd: null,
        hasActiveSubscription: false,
        error: error.response?.data?.error || error.message || 'Erreur lors de la vérification de l\'abonnement'
      };
    }
  },

  formatPhoneNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Bénin: 229 + 8 chiffres (sans le 0 initial)
    if (cleaned.startsWith('229') && cleaned.length === 11) {
      return cleaned;
    }
    
    if (cleaned.length === 8) {
      return '229' + cleaned;
    }
    
    if (cleaned.length === 9 && cleaned.startsWith('0')) {
      return '229' + cleaned.substring(1);
    }
    
    if (cleaned.length === 10 && cleaned.startsWith('229')) {
      return cleaned;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('229')) {
      return cleaned.substring(0, 11);
    }
    
    return cleaned;
  },

  validatePhoneNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    const regex = /^(229\d{8}|0\d{8})$/;
    
    if (!regex.test(cleaned)) {
      return {
        valid: false,
        message: 'Format de numéro invalide. Ex: 229 97 00 00 00 ou 097 00 00 00'
      };
    }
    
    return {
      valid: true,
      message: 'Numéro valide',
      formatted: cleaned.startsWith('229') ? cleaned : '229' + cleaned.substring(1)
    };
  }
};

export default paymentService;