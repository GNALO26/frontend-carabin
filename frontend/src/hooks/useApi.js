import { useState, useCallback } from 'react';
import useIsMounted from './useIsMounted';

/**
 * Hook personnalisé pour gérer les appels API de manière sécurisée
 * Gère automatiquement le chargement, les erreurs et annule les requêtes si nécessaire
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useIsMounted();

  const callApi = useCallback(async (apiCall, options = {}) => {
    const {
      onSuccess,
      onError,
      onFinally,
      suppressErrors = false
    } = options;

    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (isMounted.current) {
        if (onSuccess) {
          onSuccess(response);
        }
      }
      
      return response;
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        if (onError) {
          onError(err);
        }
        
        if (!suppressErrors) {
          console.error('API Error:', err);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        if (onFinally) {
          onFinally();
        }
      }
    }
  }, [isMounted]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, callApi, resetError };
};

export default useApi;