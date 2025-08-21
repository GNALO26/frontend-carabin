import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const HomePage = () => {
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token");
    if (token) {
      // Ici vous devriez décoder le JWT ou faire une requête pour obtenir les infos utilisateur
      // Pour l'instant, on va juste indiquer qu'un utilisateur est connecté
      setUser({ isLoggedIn: true });
    }

    // Charger les quiz en vedette
    const fetchFeaturedQuizzes = async () => {
      try {
        const { data } = await API.get("/quiz/featured");
        setFeaturedQuizzes(data.quizzes || []);
      } catch (error) {
        console.error("Erreur lors du chargement des quiz:", error);
        setFeaturedQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-800">🩺 Quiz de Carabin</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Mon tableau de bord
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6">
            Testez vos connaissances médicales
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Quiz interactifs et enrichis pour les étudiants en médecine. 
            Connectez-vous pour suivre votre progression et défiez vos collègues !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Commencer maintenant
            </Link>
            <Link
              to="/quizzes"
              className="px-8 py-4 bg-white text-blue-600 border border-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition duration-300"
            >
              Voir les quiz disponibles
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Quizzes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Quiz Populaires</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredQuizzes.length > 0 ? (
                featuredQuizzes.map((quiz) => (
                  <div key={quiz._id} className="bg-blue-50 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 mb-4">{quiz.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{quiz.questions?.length || 0} questions</span>
                        <Link 
                          to={`/quiz/${quiz._id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Commencer
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500 text-lg">Aucun quiz disponible pour le moment.</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/quizzes"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voir tous les quiz
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Pourquoi choisir Quiz de Carabin ?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4 text-blue-600">📚</div>
              <h3 className="text-xl font-semibold mb-2">Quiz Variés</h3>
              <p className="text-gray-600">Accédez à une large sélection de quiz médicaux pour tester vos connaissances.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4 text-blue-600">📊</div>
              <h3 className="text-xl font-semibold mb-2">Suivi de Progression</h3>
              <p className="text-gray-600">Suivez vos résultats et améliorez vos compétences au fil du temps.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4 text-blue-600">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Défis entre Amis</h3>
              <p className="text-gray-600">Défiez vos collègues et comparez vos scores pour une expérience compétitive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Abonnez-vous pour plus de fonctionnalités</h2>
          
          <div className="bg-blue-50 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Abonnement Premium</h3>
              <p className="text-gray-600 mb-6">Accédez à tous nos quiz et fonctionnalités avancées</p>
              
              <div className="flex items-end mb-6">
                <span className="text-4xl font-bold text-blue-800">5 000 FCFA</span>
                <span className="text-gray-500 ml-2">/ mois</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accès à tous les quiz spécialisés
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Statistiques détaillées de progression
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Certificats de réussite
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Défis exclusifs
                </li>
              </ul>
              
              <Link
                to="/payment"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                S'abonner maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold">🩺 Quiz de Carabin</span>
              <p className="text-gray-400 mt-2">Testez vos connaissances médicales</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2025 Quiz de Carabin. Tous droits réservés.</p>
              <p className="text-gray-400 mt-2">Contact: quizdecarabin4@gmail.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;