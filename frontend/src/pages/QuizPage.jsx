import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await API.get("/quizzes");
        setQuizzes(data);
      } catch (err) {
        setError("Erreur lors du chargement des quiz");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  if (loading) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">Quiz Disponibles</h1>
        
        {quizzes.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Aucun quiz disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="card">
                <h2 className="text-xl font-semibold text-blue-700 mb-3">{quiz.title}</h2>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <p className="text-sm text-gray-500 mb-4">{quiz.questions?.length || 0} questions</p>
                <Link
                  to={`/quiz/${quiz._id}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                >
                  Commencer le quiz
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
