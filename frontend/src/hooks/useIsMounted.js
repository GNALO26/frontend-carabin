import { useRef, useEffect } from 'react';

/**
 * Hook personnalisé pour vérifier si un composant est monté
 * Évite les erreurs de mise à jour d'état sur des composants démontés
 */
const useIsMounted = () => {
  const isMounted = useRef(true);

  useEffect(() => {
    // Au montage du composant
    isMounted.current = true;
    
    // Au démontage du composant
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};

export default useIsMounted;