// frontend/src/services/quiz.js
import API from "./api";

export const QuizService = {
  // Récupérer un quiz par ID
  getQuizById: async (id) => {
    const response = await API.get(`/quiz/${id}`);
    return response.data;
  },
  
  // Démarrer un quiz
  startQuiz: async (quizId) => {
    const response = await API.post(`/quiz/${quizId}/start`);
    return response.data;
  },
  
  // Soumettre un quiz
  submitQuiz: async (quizId, answers, startTime) => {
    const response = await API.post(`/quiz/${quizId}/submit`, {
      answers,
      startTime,
    });
    return response.data;
  },
  
  // Récupérer les résultats d'un quiz
  getQuizResults: async (attemptId) => {
    const response = await API.get(`/quiz/attempts/${attemptId}`);
    return response.data;
  },
  
  // Récupérer toutes les tentatives de l’utilisateur connecté
  getUserAttempts: async () => {
    const response = await API.get(`/quiz/attempts`);
    return response.data;
  }
};
