import API from './api';

export const QuizService = {
  // Récupérer tous les quiz
  getAllQuizzes: async () => {
    try {
      const response = await API.get('/quizzes');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du chargement des quiz');
    }
  },

  // Récupérer un quiz par ID
  getQuizById: async (id) => {
    try {
      const response = await API.get(`/quiz/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du chargement du quiz');
    }
  },

  // Soumettre un quiz
  submitQuiz: async (quizId, answers, timeSpent) => {
    try {
      const response = await API.post('/quiz/submit', {
        quizId,
        answers,
        timeSpent
      });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la soumission du quiz');
    }
  },

  // Récupérer les statistiques
  getStats: async () => {
    try {
      const response = await API.get('/quiz/stats');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du chargement des statistiques');
    }
  }
};