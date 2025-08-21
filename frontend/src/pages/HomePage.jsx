import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-6 animate-fade-in">
            🩺 Bienvenue sur Carabin Quiz
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Testez vos connaissances médicales à travers des quiz interactifs et enrichis. 
            Connectez-vous pour suivre votre progression et défiez vos amis !
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1 transition duration-300"
            >
              Commencer
            </Link>
            <Link
              to="/quizzes"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg transform hover:-translate-y-1 transition duration-300"
            >
              Essayer un quiz
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 text-gray-600 text-sm">
        <p>© 2025 Quiz de Carabin. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default HomePage;