import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0
  });

  useEffect(() => {
    const fetchUserActivities = async () => {
      try {
        const [resultsResponse, activitiesResponse] = await Promise.all([
          API.get("/results/user"),
          API.get("/activities/user")
        ]);

        // Traiter les résultats des quizs
        const quizResults = resultsResponse.data;
        setActivities(activitiesResponse.data);

        // Calculer les statistiques
        if (quizResults.length > 0) {
          const totalQuizzes = quizResults.length;
          const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
          const averageScore = Math.round((totalScore / totalQuizzes) * 100) / 100;
          const bestScore = Math.max(...quizResults.map(result => result.score));

          setStats({
            totalQuizzes,
            averageScore,
            bestScore
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des activités:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Quizs complétés</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalQuizzes}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Score moyen</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.averageScore}%</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Meilleur score</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.bestScore}%</p>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Activités récentes</h2>
          
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{activity.title}</h3>
                      <p className="text-gray-600">{activity.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune activité récente.</p>
          )}
        </div>

        {/* Quizs récents */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quizs récents</h2>
          {/* Ajoutez ici la liste des quizs récemment complétés */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;