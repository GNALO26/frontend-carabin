import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedQuizzes = async () => {
      try {
        const { data } = await API.get("/quizzes/featured");
        setFeaturedQuizzes(data.quizzes || []);
      } catch (error) {
        console.error(error);
        setFeaturedQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedQuizzes();
  }, []);

  const handlePremiumClick = () => {
    if (!currentUser) navigate("/login");
    else navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Testez vos connaissances médicales</h1>
          <p className="text-xl mb-8">Quiz interactifs pour étudiants en médecine. Connectez-vous pour suivre votre progression.</p>
          <div className="flex gap-4">
            <Link to="/register" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50">Commencer maintenant</Link>
            <Link to="/quizzes" className="px-8 py-4 border-2 border-white rounded-lg hover:bg-white hover:text-blue-600">Voir les quiz</Link>
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Quiz Populaires</h2>
          {loading ? <div className="flex justify-center"><div className="animate-spin h-12 w-12 border-2 border-blue-500 border-t-transparent rounded-full"></div></div> :
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredQuizzes.length > 0 ? featuredQuizzes.map(q => (
                <div key={q._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2">{q.title}</h3>
                  <p className="text-gray-600 flex-grow">{q.description}</p>
                  <span className={`mb-4 inline-block px-2 py-1 rounded text-xs font-semibold ${q.free ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                    {q.free ? "Gratuit" : "Payant"}
                  </span>
                  <Link to={`/quiz/${q._id}`} className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Commencer</Link>
                </div>
              )) :
                <div className="col-span-3 text-center py-12">Aucun quiz disponible.</div>
              }
            </div>
          }
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Passez à la version Premium</h2>
        <p className="mb-6">Accédez à tous les quiz et fonctionnalités avancées.</p>
        <button onClick={handlePremiumClick} className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
          Abonnez-vous maintenant
        </button>
      </section>
    </div>
  );
};

export default HomePage;
