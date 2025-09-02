import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import API, { createCancelToken } from "../services/api";
import { useIsMounted } from "../hooks";

const DashboardPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0
  });
  
  const isMounted = useIsMounted();

  useEffect(() => {
    let cancelTokenSource = null;

    const fetchUserActivities = async () => {
      cancelTokenSource = createCancelToken();
      
      try {
        const [resultsResponse, activitiesResponse] = await Promise.all([
          API.get("/results/user", { cancelToken: cancelTokenSource.token }),
          API.get("/activities/user", { cancelToken: cancelTokenSource.token })
        ]);

        // Traiter les résultats des quizs
        const quizResults = resultsResponse.data;
        
        if (isMounted.current) {
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
        }
      } catch (error) {
        if (isMounted.current && !axios.isCancel(error)) {
          console.error("Erreur lors du chargement des activités:", error);
          setError("Erreur lors du chargement des données. Veuillez réessayer.");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchUserActivities();

    return () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel("Composant démonté, requête annulée");
      }
    };
  }, [isMounted]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
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