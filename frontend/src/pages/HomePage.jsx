import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const HomePage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem("token");
      if (token) setUser({ isLoggedIn: true });

      try {
        // Récupérer tous les quizs disponibles
        const response = await API.get("/quizzes");
        console.log("Réponse API:", response.data);

        if (response.data && Array.isArray(response.data)) {
          // Filtrer pour n'afficher que les trois quizs existants
          const existingQuizzes = response.data.filter(quiz => 
            quiz.title.includes("Physiologie") || 
            quiz.category === "physiologie-musculaire" ||
            quiz.category === "physiologie-respiratoire" ||
            quiz.category === "physiologie-renale"
          );
          
          setQuizzes(existingQuizzes);
        } else {
          setError("Format de réponse inattendu de l'API");
          setQuizzes([]);
        }
      } catch (err) {
        console.error("Erreur complète:", err);
        console.error("Détails de l'erreur:", err.response?.data || err.message);
        setError("Impossible de charger les quiz. Veuillez réessayer.");
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section - inchangée */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Testez vos connaissances médicales
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Quiz interactifs et enrichis pour les étudiants en médecine. 
                Connectez-vous pour suivre votre progression et défiez vos collègues !
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition duration-300 text-center"
                >
                  Commencer maintenant
                </Link>
                <Link
                  to="/quizzes"
                  className="px-8 py-4 bg-transparent text-white border-2 border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition duration-300 text-center"
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
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Quizs Disponibles</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Découvrez les quizs spécialisés pour les étudiants en médecine</p>
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
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <div key={quiz._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
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
                        <Link to={`/quiz/${quiz._id}`} className="w-full block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                          Commencer
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto shadow-md">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun quiz disponible pour le moment</h3>
                    <p className="text-gray-600">Revenez bientôt pour découvrir nos nouveaux quiz!</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir Quiz de Carabin ?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Une plateforme conçue spécialement pour les étudiants en médecine</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Variés</h3>
              <p className="text-gray-600">Accédez à une large sélection de quiz médicaux pour tester vos connaissances.</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Suivi de Progression</h3>
              <p className="text-gray-600">Suivez vos résultats et améliorez vos compétences au fil du temps.</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full text-purple-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Défis entre Amis</h3>
              <p className="text-gray-600">Défiez vos collègues et comparez vos scores pour une expérience compétitive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Abonnez-vous pour plus de fonctionnalités</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Accédez à tous nos quiz et fonctionnalités avancées</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
              {/* Left part */}
              <div className="md:w-2/3 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Abonnement Premium</h3>
                <p className="text-gray-600 mb-6">Tout ce dont vous avez besoin pour exceller dans vos études médicales</p>

                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-blue-600">5 000 FCFA</span>
                  <span className="text-gray-500 ml-2">/ mois</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Accès à tous les quiz spécialisés",
                    "Statistiques détaillées de progression",
                    "Certificats de réussite",
                    "Défis exclusifs",
                    "Support prioritaire",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/payment"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  S'abonner maintenant
                </Link>
              </div>

              {/* Right part */}
              <div className="md:w-1/3 bg-blue-600 text-white p-8 flex flex-col justify-center text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h4 className="text-xl font-bold mb-2">Premium Exclusive</h4>
                <p className="text-blue-100">
                  Rejoignez des milliers d'étudiants qui améliorent leurs connaissances médicales avec notre abonnement premium.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à tester vos connaissances ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Rejoignez la communauté Quiz de Carabin dès aujourd'hui
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition duration-300"
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;