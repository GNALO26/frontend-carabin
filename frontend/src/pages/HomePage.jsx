import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const HomePage = () => {
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser({ isLoggedIn: true });
  }, []);

  useEffect(() => {
    const fetchFeaturedQuizzes = async () => {
      try {
        const response = await API.get("/quizzes/featured");
        const data = response.data;

        if (Array.isArray(data.quizzes)) {
          setFeaturedQuizzes(data.quizzes);
        } else if (Array.isArray(data)) {
          setFeaturedQuizzes(data);
        } else {
          setError("Format inattendu de la réponse de l'API.");
        }
      } catch (err) {
        console.error("Erreur API:", err);
        setError("Impossible de charger les quiz. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Testez vos connaissances médicales
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Quiz interactifs pour étudiants en médecine. Connectez-vous pour suivre votre progression.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 text-center"
              >
                Commencer maintenant
              </Link>
              <Link
                to="/quizzes"
                className="px-8 py-4 bg-transparent text-white border-2 border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 text-center"
              >
                Voir les quiz disponibles
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-400 rounded-full opacity-20 animate-pulse delay-500"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 text-gray-800">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Exemple de quiz</h3>
                <p className="mb-6">Découvrez nos quiz spécialisés pour étudiants en médecine</p>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">A. Physiologie respiratoire</div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">B. Physiologie rénale</div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">C. Physiologie musculaire</div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">D. Cardiologie</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Populaires</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Découvrez les quiz les plus populaires</p>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredQuizzes.length > 0 ? (
                featuredQuizzes.map((quiz) => (
                  <QuizCard key={quiz._id} quiz={quiz} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto shadow-md">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun quiz disponible</h3>
                    <p className="text-gray-600">Revenez bientôt pour découvrir nos nouveaux quiz !</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/quizzes"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 font-medium rounded-md hover:bg-blue-600 hover:text-white"
            >
              Voir tous les quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const QuizCard = ({ quiz }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
    <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{quiz.title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{quiz.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {quiz.questions?.length || 0} questions
        </span>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${quiz.free ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {quiz.free ? 'Gratuit' : 'Premium'}
        </span>
      </div>
      <div className="mt-4">
        <Link to={`/quiz/${quiz._id}`} className="w-full block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium">
          Commencer
        </Link>
      </div>
    </div>
  </div>
);

export default HomePage;
