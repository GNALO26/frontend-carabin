import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/payment';

/**
 * Hook personnalisé pour gérer l'état d'abonnement de l'utilisateur
 * Fournit des méthodes pour vérifier et gérer l'abonnement
 */
const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const result = await paymentService.getSubscriptionStatus();
        
        if (result.success) {
          setSubscriptionStatus({
            isSubscribed: result.hasActiveSubscription,
            isLoading: false,
            error: null
          });
        } else {
          setSubscriptionStatus({
            isSubscribed: false,
            isLoading: false,
            error: result.error
          });
        }
      } catch (error) {
        setSubscriptionStatus({
          isSubscribed: false,
          isLoading: false,
          error: error.message
        });
      }
    };

    if (user) {
      checkSubscription();
    } else {
      setSubscriptionStatus({
        isSubscribed: false,
        isLoading: false,
        error: 'Utilisateur non connecté'
      });
    }
  }, [user]);

  const refreshSubscription = async () => {
    setSubscriptionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await paymentService.getSubscriptionStatus();
      
      if (result.success) {
        setSubscriptionStatus({
          isSubscribed: result.hasActiveSubscription,
          isLoading: false,
          error: null
        });
      } else {
        setSubscriptionStatus({
          isSubscribed: false,
          isLoading: false,
          error: result.error
        });
      }
    } catch (error) {
      setSubscriptionStatus({
        isSubscribed: false,
        isLoading: false,
        error: error.message
      });
    }
  };

  return { ...subscriptionStatus, refreshSubscription };
};

export default useSubscription;