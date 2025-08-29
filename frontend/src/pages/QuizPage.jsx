import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const QuizzesPage = () => {
  const [freeQuizzes, setFreeQuizzes] = useState([]);
  const [premiumQuizzes, setPremiumQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Récupérer token si connecté
        const token = localStorage.getItem("token"); // ou adminToken selon ton setup
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [freeRes, premiumRes] = await Promise.all([
          API.get("/quizzes/free", { headers }),
          API.get("/quizzes/premium", { headers }),
        ]);

        setFreeQuizzes(freeRes.data || []);
        setPremiumQuizzes(premiumRes.data || []);
      } catch (err) {
        setError("Erreur lors du chargement des quiz");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

        {/* Section quiz gratuits */}
        <h2 className="text-2xl font-semibold mb-4">Quiz Gratuits</h2>
        <QuizGrid quizzes={freeQuizzes} />

        {/* Section quiz premium */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">Quiz Premium</h2>
        <QuizGrid quizzes={premiumQuizzes} />
      </div>
    </div>
  );
};

const QuizGrid = ({ quizzes }) => {
  if (quizzes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center mb-6">
        <p className="text-gray-600">Aucun quiz disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 mb-6">
      {quizzes.map((quiz) => (
        <div key={quiz._id} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">{quiz.title}</h3>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          <p className="text-sm text-gray-500 mb-4">{quiz.questions?.length || 0} questions</p>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full mb-3 inline-block ${!quiz.free ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {!quiz.free ? 'Premium' : 'Gratuit'}
          </span>
          <Link
            to={`/quiz/${quiz._id}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Commencer le quiz
          </Link>
        </div>
      ))}
    </div>
  );
};

export default QuizzesPage;
