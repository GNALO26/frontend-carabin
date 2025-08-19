import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Ne pas afficher le header sur certaines pages
  if (location.pathname.includes('/admin') || location.pathname.includes('/quiz/')) {
    return null;
  }

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <span>Quiz de Carabin</span>
        </Link>
        
        <nav className="hidden md:flex space-x-4">
          <Link to="/" className="hover:underline">Accueil</Link>
          <Link to="/quiz" className="hover:underline">Quiz</Link>
          {user && <Link to="/dashboard" className="hover:underline">Tableau de bord</Link>}
        </nav>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Link to="/profile" className="hidden sm:block hover:underline">
                {user.name}
              </Link>
              <Button 
                variant="outline-white" 
                size="sm"
                onClick={logout}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline-white" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Inscription
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;