import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const AdminQuizzesPage = () => {
  const [freeQuizzes, setFreeQuizzes] = useState([]);
  const [premiumQuizzes, setPremiumQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      const [freeRes, premiumRes] = await Promise.all([
        API.get('/quizzes/free', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/quizzes/premium', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setFreeQuizzes(freeRes.data || []);
      setPremiumQuizzes(premiumRes.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await API.delete(`/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (type === "free") {
          setFreeQuizzes(freeQuizzes.filter(quiz => quiz._id !== id));
        } else {
          setPremiumQuizzes(premiumQuizzes.filter(quiz => quiz._id !== id));
        }
      } catch (err) {
        setError('Erreur lors de la suppression du quiz');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Quiz</h1>
        <button
          onClick={() => navigate('/admin/quizzes/new')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Créer un quiz
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Section Gratuit */}
      <h2 className="text-xl font-semibold mb-4">Quiz Gratuits</h2>
      <QuizTable quizzes={freeQuizzes} onDelete={(id) => handleDelete(id, "free")} navigate={navigate} />

      {/* Section Premium */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Quiz Premium</h2>
      <QuizTable quizzes={premiumQuizzes} onDelete={(id) => handleDelete(id, "premium")} navigate={navigate} />
    </div>
  );
};

const QuizTable = ({ quizzes, onDelete, navigate }) => (
  <div className="bg-white shadow-md rounded overflow-hidden mb-6">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {quizzes.map((quiz) => (
          <tr key={quiz._id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
              <div className="text-sm text-gray-500">{quiz.description}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${!quiz.free ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {!quiz.free ? 'Premium' : 'Gratuit'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {quiz.questions?.length || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => navigate(`/admin/quizzes/edit/${quiz._id}`)}
                className="text-blue-600 hover:text-blue-900 mr-4"
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(quiz._id)}
                className="text-red-600 hover:text-red-900"
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {quizzes.length === 0 && (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun quiz disponible</p>
      </div>
    )}
  </div>
);

export default AdminQuizzesPage;
