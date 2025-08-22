import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-2xl font-bold text-blue-800">🩺 Quiz de Carabin</span>
            </Link>
          </div>
          
          {/* Menu desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`${location.pathname === '/' ? 'text-blue-800 font-medium' : 'text-gray-700'} hover:text-blue-600 transition-colors`}
            >
              Accueil
            </Link>
            <Link 
              to="/quizzes" 
              className={`${location.pathname === '/quizzes' ? 'text-blue-800 font-medium' : 'text-gray-700'} hover:text-blue-600 transition-colors`}
            >
              Quiz
            </Link>
            <Link 
              to="/about" 
              className={`${location.pathname === '/about' ? 'text-blue-800 font-medium' : 'text-gray-700'} hover:text-blue-600 transition-colors`}
            >
              À propos
            </Link>
            <Link 
              to="/contact" 
              className={`${location.pathname === '/contact' ? 'text-blue-800 font-medium' : 'text-gray-700'} hover:text-blue-600 transition-colors`}
            >
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Inscription
            </Link>
          </div>
          
          {/* Menu mobile button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white px-4 pt-2 pb-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`${location.pathname === '/' ? 'text-blue-800 font-medium' : 'text-gray-700'} py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/quizzes" 
                className={`${location.pathname === '/quizzes' ? 'text-blue-800 font-medium' : 'text-gray-700'} py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Quiz
              </Link>
              <Link 
                to="/about" 
                className={`${location.pathname === '/about' ? 'text-blue-800 font-medium' : 'text-gray-700'} py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link 
                to="/contact" 
                className={`${location.pathname === '/contact' ? 'text-blue-800 font-medium' : 'text-gray-700'} py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;