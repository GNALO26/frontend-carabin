import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personnalisé pour protéger les routes nécessitant une authentification
 * Redirige automatiquement vers la page de login si l'utilisateur n'est pas connecté
 */
const useAuthGuard = (redirectPath = '/login') => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, navigate, redirectPath]);

  return { user, isLoading };
};

export default useAuthGuard;