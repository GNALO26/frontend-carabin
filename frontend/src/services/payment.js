// src/services/paymentService.jsx
import API from './api';

/**
 * Service de gestion des paiements
 * Centralise toutes les opérations liées aux paiements CinetPay
 */
export const paymentService = {
  /**
   * Initier un paiement CinetPay
   * @param {Object} paymentData - Données du paiement
   * @param {number} paymentData.amount - Montant du paiement
   * @param {string} paymentData.description - Description du paiement
   * @param {string} paymentData.phone - Numéro de téléphone pour le paiement
   * @returns {Promise} Promise avec les données de paiement
   */
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
        transaction_id: response.data.transaction_id,
        error: null
      };
    } catch (error) {
      console.error('Erreur initiation paiement:', error);
      return {
        success: false,
        payment_url: null,
        transaction_id: null,
        error: error.response?.data?.error || error.message || 'Erreur lors de l\'initialisation du paiement'
      };
    }
  },

  /**
   * Vérifier le statut d'un paiement
   * @param {string} transactionId - ID de la transaction
   * @returns {Promise} Promise avec le statut du paiement
   */
  verifyPayment: async (transactionId) => {
    try {
      const response = await API.post('/payment/verify', {
        transactionId
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

  /**
   * Vérifier le statut d'abonnement de l'utilisateur
   * @returns {Promise} Promise avec le statut d'abonnement
   */
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

  /**
   * Formater un numéro de téléphone pour CinetPay
   * @param {string} phone - Numéro de téléphone à formater
   * @returns {string} Numéro formaté (229XXXXXXXXX)
   */
  formatPhoneNumber: (phone) => {
    // Nettoyer le numéro (supprimer espaces, caractères spéciaux)
    const cleaned = phone.replace(/\D/g, '');
    
    // Si le numéro commence par 229, le retourner tel quel
    if (cleaned.startsWith('229')) {
      return cleaned;
    }
    
    // Si le numéro a 10 chiffres et commence par 0, ajouter l'indicatif 229
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return '229' + cleaned.substring(1);
    }
    
    // Si le numéro a 9 chiffres (sans le 0), ajouter l'indicatif 229
    if (cleaned.length === 9) {
      return '229' + cleaned;
    }
    
    // Retourner le numéro original si le format n'est pas reconnu
    return cleaned;
  },

  /**
   * Valider un numéro de téléphone
   * @param {string} phone - Numéro de téléphone à valider
   * @returns {Object} Résultat de la validation
   */
  validatePhoneNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    // Formats acceptés: 229XXXXXXXXX ou 0XXXXXXXXX
    const regex = /^(229\d{9}|0\d{9})$/;
    
    if (!regex.test(cleaned)) {
      return {
        valid: false,
        message: 'Format de numéro invalide. Ex: 229 97 00 00 00'
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