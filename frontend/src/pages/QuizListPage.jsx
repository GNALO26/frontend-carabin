import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState({
    free: [],
    premium: [],
    generated: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les types de quiz en parallèle
        const [freeRes, premiumRes, generatedRes] = await Promise.all([
          API.get("/quiz/free"),
          API.get("/quiz/premium"),
          API.get("/quizzes")
        ]);

        setQuizzes({
          free: freeRes.data,
          premium: premiumRes.data,
          generated: generatedRes.data
        });
      } catch (err) {
        setError("Impossible de charger les quiz. Vérifiez votre connexion.");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) return <LoadingSpinner size="large" text="Chargement des quiz..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  const QuizSection = ({ title, quizzes, type }) => (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>
      {quizzes.length === 0 ? (
        <p className="text-gray-600">Aucun quiz disponible pour le moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <div key={quiz._id || index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">
                {quiz.title || quiz.replace(".html", "")}
              </h3>
              {quiz.description && (
                <p className="text-gray-600 mb-4">{quiz.description}</p>
              )}
              <button
                onClick={() => {
                  if (type === 'generated') {
                    navigate(`/generated/${encodeURIComponent(quiz)}`);
                  } else {
                    navigate(`/quiz/${quiz._id}`);
                  }
                }}
                className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                  type === 'premium' 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : type === 'generated'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {type === 'generated' ? 'Ouvrir' : 'Commencer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">Quiz Disponibles</h1>

        <QuizSection title="Quiz Gratuit" quizzes={quizzes.free} type="free" />
        <QuizSection title="Quiz Premium" quizzes={quizzes.premium} type="premium" />
        <QuizSection title="Quiz Générés" quizzes={quizzes.generated} type="generated" />
      </div>
    </div>
  );
};

export default QuizListPage;