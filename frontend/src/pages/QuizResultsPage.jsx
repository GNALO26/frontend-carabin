import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Chemin corrigé
import api from '../services/api';
import QuizResults from '../components/quiz/QuizResults';
import Button from '../components/ui/Button';

const QuizResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Si les résultats sont passés via l'état de navigation
        if (location.state?.result) {
          setResult(location.state.result);
          
          // Récupérer les détails complets du quiz
          const quizResponse = await api.get(`/quizzes/${id}`);
          setQuiz(quizResponse.data);
        } 
        // Sinon, récupérer depuis l'API
        else if (user) {
          const resultResponse = await api.get(`/results/quiz/${id}`);
          setResult(resultResponse.data);
          
          const quizResponse = await api.get(`/quizzes/${resultResponse.data.quizId}`);
          setQuiz(quizResponse.data);
        }
      } catch (err) {
        setError('Erreur de chargement des résultats');
        console.error('Erreur chargement résultats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.state, user]);

  if (loading) return <div className="text-center py-12">Chargement des résultats...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!result || !quiz) return <div className="text-center py-12">Aucun résultat trouvé</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Résultats du Quiz</h1>
        <h2 className="text-xl mb-6">{quiz.title}</h2>
        
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-3xl font-bold">{result.percentage}%</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Réussite</p>
            <p className="text-3xl font-bold">
              {result.score}/{result.totalQuestions}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Temps</p>
            <p className="text-3xl font-bold">
              {Math.floor(result.timeTaken / 60)}:{String(result.timeTaken % 60).padStart(2, '0')}
            </p>
          </div>
        </div>
        
        <QuizResults 
          questions={quiz.questions} 
          userAnswers={result.answers} 
        />
      </div>
      
      <div className="flex justify-center gap-4">
        <Button onClick={() => navigate(`/quiz/${quiz._id}`)} variant="secondary">
          Refaire le quiz
        </Button>
        
        <Button onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default QuizResultsPage;