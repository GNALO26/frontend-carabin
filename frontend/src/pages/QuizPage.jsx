// frontend/src/pages/QuizPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuizService } from "../services/quiz";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await QuizService.getQuizById(id);
        setQuiz(data);
      } catch (err) {
        setError("Impossible de charger le quiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleAnswer = (option) => {
    setAnswers({
      ...answers,
      [quiz.questions[currentQuestion]._id]: option,
    });
    setCurrentQuestion(currentQuestion + 1);
  };

  const handleSubmit = async () => {
    try {
      const res = await QuizService.submitQuiz(id, answers, Date.now());
      setResult(res);
    } catch (err) {
      setError("Erreur lors de la soumission du quiz.");
    }
  };

  if (loading) return <p>Chargement du quiz...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!quiz) return <p>Aucun quiz trouvé.</p>;

  if (result) {
    return (
      <div className="text-center bg-white shadow-lg rounded-xl p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">Résultat 🎉</h1>
        <p className="text-lg">
          Score :{" "}
          <span className="font-bold">{result.score}</span> /{" "}
          {quiz.questions.length}
        </p>
        <button
          onClick={() => navigate("/quizzes")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retour aux quiz
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {currentQuestion < quiz.questions.length ? (
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto">
          <h1 className="text-xl font-bold mb-4">
            {quiz.questions[currentQuestion].text}
          </h1>
          <div className="grid gap-3">
            {quiz.questions[currentQuestion].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="w-full bg-blue-100 text-blue-800 p-3 rounded-lg hover:bg-blue-200 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Vous avez répondu à toutes les questions ✅</p>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Soumettre mes réponses
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
