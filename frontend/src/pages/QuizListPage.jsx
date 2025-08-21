import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await API.get("/quizzes");
        setQuizzes(data.quizzes);
      } catch (err) {
        setError("Erreur lors du chargement des quiz");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{quiz.questions.length} questions</span>
                  <Link 
                    to={`/quiz/${quiz._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Commencer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun quiz disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;