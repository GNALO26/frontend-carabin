import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const QuizListPage = () => {
  const [quizzesByCategory, setQuizzesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await API.get("/quizzes");
        
        // Grouper les quizzes par catégorie
        const grouped = data.reduce((acc, quiz) => {
          if (!acc[quiz.category]) {
            acc[quiz.category] = [];
          }
          acc[quiz.category].push(quiz);
          return acc;
        }, {});
        
        setQuizzesByCategory(grouped);
      } catch (err) {
        setError("Erreur lors du chargement des quiz");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Fonction pour formater les noms de catégories
  const formatCategoryName = (category) => {
    const categoryNames = {
      'tissu-epithelial': 'Tissu Épithélial',
      'tissu-conjonctif': 'Tissu Conjonctif',
      'tissu-cartilagineux': 'Tissu Cartilagineux',
      'tissu-osseux': 'Tissu Osseux',
      'physiologie-renale': 'Physiologie Rénale',
      'cardiologie': 'Cardiologie',
      'pharmacologie': 'Pharmacologie',
      'neurologie': 'Neurologie',
      'anatomie': 'Anatomie'
    };
    
    return categoryNames[category] || category;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Tous les quiz</h1>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Mon tableau de bord
          </Link>
        </div>
        
        {Object.keys(quizzesByCategory).length > 0 ? (
          Object.entries(quizzesByCategory).map(([category, quizzes]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">
                {formatCategoryName(category)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <div key={quiz._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {quiz.questions.length} questions
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          quiz.free ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {quiz.free ? "Gratuit" : "Premium"}
                        </span>
                      </div>
                      <Link 
                        to={`/quiz/${quiz._id}`}
                        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Commencer le quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun quiz disponible pour le moment.</p>
            <Link
              to="/dashboard"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;