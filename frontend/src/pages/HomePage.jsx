import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-6">
            🩺 Bienvenue sur Quiz de Carabin
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Testez vos connaissances médicales à travers des quiz interactifs et enrichis. 
            Connectez-vous pour suivre votre progression et défiez vos amis !
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
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
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Quiz Variés</h3>
              <p className="text-gray-600">Accédez à une large sélection de quiz médicaux pour tester vos connaissances.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Suivi de Progression</h3>
              <p className="text-gray-600">Suivez vos résultats et améliorez vos compétences au fil du temps.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Défis entre Amis</h3>
              <p className="text-gray-600">Défiez vos collègues et comparez vos scores pour une expérience compétitive.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;