import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const QuizListPage = () => {
  const [quizzesByType, setQuizzesByType] = useState({ free: [], premium: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token"); // Récupère le token si l'utilisateur est connecté
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const { data } = await API.get("/api/quizzes/by-type", { headers }); // Utilise l'endpoint correct
        setQuizzesByType(data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Veuillez vous connecter pour voir les quiz premium.");
        } else {
          setError("Erreur lors du chargement des quiz.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Tous les quiz</h1>

        <QuizSection title="Quiz Gratuits" quizzes={quizzesByType.free} badgeColor="green" />
        <QuizSection title="Quiz Premium" quizzes={quizzesByType.premium} badgeColor="purple" />
      </div>
    </div>
  );
};

const QuizSection = ({ title, quizzes, badgeColor }) => {
  if (quizzes.length === 0) return <EmptyMessage />;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(quiz => (
          <div key={quiz._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{quiz.questions?.length || 0} questions</span>
                <span className={`text-sm px-2 py-1 rounded ${badgeColor === "green" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}>
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
  );
};

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
      <p>{message}</p>
    </div>
  </div>
);

const EmptyMessage = () => (
  <div className="text-center py-12">
    <p className="text-gray-500 text-lg">Aucun quiz disponible pour le moment.</p>
  </div>
);

export default QuizListPage;