import React, { useState, useEffect } from 'react';
import Question from './Question';
import Timer from './Timer';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const QuizComponent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger le quiz
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetch('/api/quiz/${id}');
        if (!response.ok) throw new Error('Quiz non trouvé');
        
        const data = await response.json();
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [id]);

  // Démarrer le quiz
  const startQuiz = async () => {
    try {
      const response = await fetch('/api/quiz/${id}/start', {
        method: 'POST',
        headers: {
          'Authorization':' Bearer ${user.token}'
        }
      });
      
      if (!response.ok) throw new Error('Impossible de démarrer le quiz');
      
      const data = await response.json();
      setStartTime(data.startTime);
      setQuizStarted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // Enregistrer une réponse
  const handleAnswer = (questionIndex, answerIndex, timeTaken) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = {
      answer: answerIndex,
      timeTaken
    };
    setAnswers(newAnswers);
  };

  // Soumettre le quiz
  const submitQuiz = async () => {
    try {
      const answersToSubmit = answers.map(a => a ? a.answer : -1);
      
      const response = await fetch('/api/quiz/${id}/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${user.token}'
        },
        body: JSON.stringify({ 
          answers: answersToSubmit,
          startTime 
        })
      });
      
      if (!response.ok) throw new Error('Échec de la soumission');
      
      const result = await response.json();
      navigate('/quiz/${id}/results', { state: { result } });
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
        <p className="mb-4">{quiz.description}</p>
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <i className="far fa-clock mr-2"></i>
            {quiz.duration} min
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <i className="far fa-question-circle mr-2"></i>
            {quiz.questions.length} questions
          </div>
        </div>
        <button 
          onClick={startQuiz}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Commencer le quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">{quiz.title}</h1>
        <Timer 
          duration={quiz.duration * 60} 
          onTimeUp={submitQuiz} 
          startTime={startTime}
        />
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} sur {quiz.questions.length}</span>
          <span>Temps restant: <Timer duration={quiz.duration * 60} startTime={startTime} /></span>
        </div>
      </div>
      
      <Question 
        question={quiz.questions[currentQuestion]} 
        questionIndex={currentQuestion}
        onAnswer={handleAnswer}
        selectedAnswer={answers[currentQuestion]?.answer}
      />
      
      <div className="flex justify-between mt-8">
        <button 
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Précédent
        </button>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <button 
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Suivant
          </button>
        ) : (
          <button 
            onClick={submitQuiz}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Terminer le quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;