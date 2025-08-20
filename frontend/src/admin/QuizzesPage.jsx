import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await api.get('/admin/quizzes');
        setQuizzes(data);
      } catch (err) {
        setError('Erreur de chargement des quiz');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce quiz définitivement?')) return;
    
    try {
      await api.delete(`/admin/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      setError('Échec de la suppression');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Quiz</h1>
        <Button onClick={() => navigate('/admin/quizzes/new')}>
          Créer un Quiz
        </Button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <div>Chargement des quiz...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12">
          <p>Aucun quiz disponible</p>
          <Button className="mt-4" onClick={() => navigate('/admin/quizzes/new')}>
            Créer votre premier quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <Card key={quiz._id} className="relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{quiz.title}</h3>
                  <p className="text-gray-600 mt-2">{quiz.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {quiz.category}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/admin/quizzes/edit/${quiz._id}`)}
                  >
                    Éditer
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(quiz._id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;