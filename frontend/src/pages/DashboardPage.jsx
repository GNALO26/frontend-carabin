import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const DashboardPage = () => {
  const [stats, setStats] = useState({ quizzesDone: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/results/stats"); // ⚡ endpoint à créer côté backend
        setStats(data);
      } catch (err) {
        console.error("Erreur stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-center">Chargement...</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Tableau de bord</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Quiz réalisés</h2>
          <p className="text-4xl font-bold text-blue-700">
            {stats.quizzesDone}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Score moyen</h2>
          <p className="text-4xl font-bold text-yellow-500">
            {stats.averageScore}%
          </p>
        </div>
      </div>
      <div className="mt-10 text-center">
        <Link
          to="/quizzes"
          className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition"
        >
          Faire un nouveau quiz
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
