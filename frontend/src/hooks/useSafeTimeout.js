import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour gérer les timeouts de manière sécurisée
 * Annule automatiquement les timeouts quand le composant est démonté
 */
const useSafeTimeout = () => {
  const timeouts = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      // Annuler tous les timeouts au démontage
      timeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeouts.current = [];
    };
  }, []);

  const safeSetTimeout = useCallback((callback, delay) => {
    if (!isMounted.current) return null;
    
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        callback();
      }
    }, delay);
    
    timeouts.current.push(timeoutId);
    return timeoutId;
  }, []);

  const safeClearTimeout = useCallback((timeoutId) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeouts.current = timeouts.current.filter(id => id !== timeoutId);
    }
  }, []);

  return { safeSetTimeout, safeClearTimeout };
};

export default useSafeTimeout;