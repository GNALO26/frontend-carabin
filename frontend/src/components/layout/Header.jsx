import React from 'react';
import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Ne pas afficher le header sur certaines pages
  if (location.pathname.includes('/admin') || location.pathname.includes('/quiz/')) {
    return null;
  }

 return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-xl font-bold tracking-wide">
          🩺 Carabin Quiz
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-yellow-300">Accueil</Link>
          <Link to="/quiz/1" className="hover:text-yellow-300">Quiz</Link>
          <Link to="/login" className="hover:text-yellow-300">Connexion</Link>
          <Link to="/register" className="hover:text-yellow-300">Inscription</Link>
        </nav>

        {/* Mobile Burger */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-600 flex flex-col space-y-2 p-4">
          <Link to="/" onClick={() => setIsOpen(false)}>Accueil</Link>
          <Link to="/quiz/1" onClick={() => setIsOpen(false)}>Quiz</Link>
          <Link to="/login" onClick={() => setIsOpen(false)}>Connexion</Link>
          <Link to="/register" onClick={() => setIsOpen(false)}>Inscription</Link>
        </div>
      )}
    </header>
  );
};

export default Header;