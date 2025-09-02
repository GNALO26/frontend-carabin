import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useIsMounted, useApi, useSafeTimeout } from "../hooks";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPremiumAccess } = useAuth();
  const isMounted = useIsMounted();
  const { callApi, loading, error: apiError } = useApi();
  const { safeSetTimeout, safeClearTimeout } = useSafeTimeout();
  
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const fetchQuiz = async () => {
      await callApi(
        async () => {
          const response = await API.get(`/quizzes/${id}`, {
            signal: controller.signal
          });
          if (isActive && isMounted.current) {
            setQuiz(response.data);
            setStartTime(new Date());
            
            // Initialiser userAnswers avec des tableaux vids pour chaque question
            const initialAnswers = {};
            response.data.questions.forEach((_, index) => {
              initialAnswers[index] = [];
            });
            setUserAnswers(initialAnswers);
          }
          return response;
        },
        {
          onError: (err) => {
            if (isActive && isMounted.current) {
              if (err.response?.status === 403) {
                setRequiresSubscription(true);
              } else {
                setError(err.response?.data?.error || "Erreur lors du chargement du quiz");
              }
            }
          }
        }
      );
    };

    if (id) {
      fetchQuiz();
    }

    return () => {
      isActive = false;
      controller.abort();
      safeClearTimeout();
    };
  }, [id, isMounted, callApi, safeClearTimeout]);

  // Chronomètre
  useEffect(() => {
    let timer;
    if (startTime && !quizFinished) {
      timer = safeSetTimeout(() => {
        if (isMounted.current) {
          setTimeTaken(Math.floor((new Date() - startTime) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (timer) {
        safeClearTimeout(timer);
      }
    };
  }, [startTime, quizFinished, isMounted, safeSetTimeout, safeClearTimeout]);

  const handleAnswerSelect = (answerIndex) => {
    if (!quiz || quizFinished) return;

    const currentSelections = [...userAnswers[currentQuestionIndex]];
    
    // Pour toutes les questions, permettre la sélection multiple
    if (currentSelections.includes(answerIndex)) {
      // Désélectionner si déjà sélectionné
      setUserAnswers({
        ...userAnswers,
        [currentQuestionIndex]: currentSelections.filter(
          (ans) => ans !== answerIndex
        )
      });
    } else {
      // Ajouter à la sélection
      setUserAnswers({
        ...userAnswers,
        [currentQuestionIndex]: [...currentSelections, answerIndex]
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setQuizFinished(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let calculatedScore = 0;
    const answersWithDetails = [];

    quiz.questions.forEach((question, index) => {
      const userSelections = userAnswers[index] || [];
      const correctAnswers = question.correctAnswers || [];

      // Vérifier si les réponses sont correctes
      // Pour toutes les questions, on utilise la même logique de choix multiple
      const correctSelections = correctAnswers.filter(ans => userSelections.includes(ans));
      const incorrectSelections = userSelections.filter(ans => !correctAnswers.includes(ans));
      
      // Une réponse est correcte si toutes les bonnes réponses sont sélectionnées
      // et qu'aucune mauvaise réponse n'est sélectionnée
      const isCorrect = correctSelections.length === correctAnswers.length && incorrectSelections.length === 0;

      if (isCorrect) {
        calculatedScore++;
      }

      answersWithDetails.push({
        questionId: question._id,
        selectedOptions: userSelections,
        isCorrect,
        timeTaken: 0
      });
    });

    setScore(calculatedScore);
    saveQuizResult(calculatedScore, answersWithDetails);
  };

  const saveQuizResult = async (finalScore, answersWithDetails) => {
    await callApi(
      async () => {
        const response = await API.post("/results", {
          quizId: id,
          score: finalScore,
          totalQuestions: quiz.questions.length,
          answers: answersWithDetails,
          timeTaken: timeTaken
        });
        return response;
      },
      {
        onError: (err) => {
          console.error("Erreur lors de la sauvegarde du résultat:", err);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requiresSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="text-yellow-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">Accès Restreint</h1>
          <p className="text-gray-600 mb-6">
            Ce quiz est réservé aux membres premium. Abonnez-vous pour y accéder.
          </p>
          <button
            onClick={() => navigate("/payment")}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            S'abonner maintenant
          </button>
        </div>
      </div>
    );
  }

  if (apiError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{apiError?.message || error}</p>
          <button
            onClick={() => navigate("/quizzes")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retour aux quiz
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Quiz non trouvé</p>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">Quiz Terminé!</h1>
            <div className="text-center mb-8">
              <p className="text-2xl font-semibold">Votre score: {score}/{quiz.questions.length}</p>
              <p className="text-lg text-gray-600 mt-2">
                {score >= quiz.questions.length * 0.7 ? "Félicitations! Vous avez réussi!" : "Essayez encore pour améliorer votre score."}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Temps passé: {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {showExplanations ? "Masquer les explications" : "Voir les explications"}
              </button>
              <button
                onClick={() => navigate("/quizzes")}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Retour aux quiz
              </button>
            </div>
            {showExplanations && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Explications</h2>
                {quiz.questions.map((question, index) => (
                  <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Vos réponses:</strong>{" "}
                      {userAnswers[index] && userAnswers[index].length > 0 
                        ? userAnswers[index].map(idx => question.options[idx]).join(", ")
                        : "Aucune réponse sélectionnée"}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Réponse(s) correcte(s):</strong>{" "}
                      {question.correctAnswers.map(idx => question.options[idx]).join(", ")}
                    </p>
                    {question.explanation && (
                      <p className="text-gray-700">
                        <strong>Explication:</strong> {question.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentSelections = userAnswers[currentQuestionIndex] || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-6">{quiz.description}</p>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} sur {quiz.questions.length}
              </span>
              <span className="text-sm text-gray-500">{timeTaken}s</span>
            </div>

            <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
            
            {/* Indication que la sélection multiple est autorisée */}
            <p className="text-sm text-gray-500 mb-4">
              (Sélection multiple autorisée - choisissez toutes les réponses correctes)
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    currentSelections.includes(index)
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center">
                    {/* Toujours utiliser des checkbox pour la sélection multiple */}
                    <div className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${
                      currentSelections.includes(index) 
                        ? "bg-blue-500 border-blue-500 text-white" 
                        : "border-gray-400"
                    }`}>
                      {currentSelections.includes(index) && "✓"}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={currentSelections.length === 0}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? "Terminer" : "Suivant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;