import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext"; // Chemin corrigé

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPremiumAccess } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    setStartTime(new Date());
    
    const fetchQuiz = async () => {
      try {
        const response = await API.get(`/quizzes/${id}`);
        const quizData = response.data;
        
        if (!quizData.free && !hasPremiumAccess()) {
          setRequiresSubscription(true);
          setLoading(false);
          return;
        }
        
        const uniqueQuestions = [];
        const seenQuestions = new Set();
        
        quizData.questions.forEach(question => {
          const questionKey = question.text.trim().toLowerCase();
          if (!seenQuestions.has(questionKey)) {
            seenQuestions.add(questionKey);
            uniqueQuestions.push(question);
          }
        });
        
        setQuiz({ ...quizData, questions: uniqueQuestions });
      } catch (err) {
        if (err.response?.status === 403) {
          setRequiresSubscription(true);
        } else {
          setError("Erreur lors du chargement du quiz");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, hasPremiumAccess]);

  // Chronomètre
  useEffect(() => {
    let timer;
    if (startTime && !quizFinished) {
      timer = setInterval(() => {
        setTimeTaken(Math.floor((new Date() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, quizFinished]);

  const handleAnswerSelect = (answerIndex) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setQuizFinished(true);
    }
  };

  const calculateScore = () => {
    let calculatedScore = 0;
    const answersWithDetails = [];
    
    quiz.questions.forEach((question, index) => {
      const correctAnswers = Array.isArray(question.correctAnswers) 
        ? question.correctAnswers 
        : [question.correctAnswers];
      
      const isCorrect = correctAnswers.includes(selectedAnswers[index]);
      
      if (isCorrect) {
        calculatedScore += 1;
      }
      
      answersWithDetails.push({
        questionIndex: index,
        selectedAnswer: selectedAnswers[index],
        isCorrect
      });
    });
    
    setScore(calculatedScore);
    saveQuizResult(calculatedScore, answersWithDetails);
  };

  const saveQuizResult = async (finalScore, answersWithDetails) => {
    try {
      await API.post('/results', {
        quizId: id,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        answers: answersWithDetails,
        timeTaken: timeTaken
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du résultat:", error);
    }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
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
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-6">{quiz.description}</p>
          
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} sur {quiz.questions.length}
              </span>
              <span className="text-sm text-gray-500">
                Temps: {quiz.duration} minutes
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? "bg-blue-100 border-blue-500"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Précédent
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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