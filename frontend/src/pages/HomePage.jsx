import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 p-6">
      <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-6">
        🩺 Bienvenue sur Carabin Quiz
      </h1>
      <p className="text-lg md:text-xl text-gray-700 mb-10 text-center max-w-2xl">
        Teste tes connaissances médicales à travers des quiz interactifs et
        enrichis. Connecte-toi pour suivre ta progression et défie tes amis !
      </p>
      <div className="flex space-x-4">
        <Link
          to="/register"
          className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition"
        >
          Commencer
        </Link>
        <Link
          to="/quiz/1"
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
        >
          Essayer un quiz
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
