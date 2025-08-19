import api from './api';

export const QuizService = {
  // Récupérer un quiz par ID
  getQuizById: async (id) => {
    const response = await api.get('/quiz/${id}');
    return response.data;
  },
  
  // Démarrer un quiz
  startQuiz: async (quizId) => {
    const response = await api.post('/quiz/${quizId}'/start);
    return response.data;
  },
  
  // Soumettre un quiz
  submitQuiz: async (quizId, answers, startTime) => {
    const response = await api.post('/quiz/${quizId}'/submit, {
      answers,
      startTime
    });
    return response.data;
  },
  
  // Récupérer les résultats d'un quiz
  getQuizResults: async (attemptId) => {
    const response = await api.get('/quiz/attempts/${attemptId}');
    return response.data;
  },
  
  // Récupérer les tentatives d'un utilisateur
  getUserAttempts: async () => {
    const response = await api.get('/quiz/attempts');
    return response.data;
  }
};