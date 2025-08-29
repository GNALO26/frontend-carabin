import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const DashboardPage = () => {
  const [stats, setStats] = useState({ quizzesDone: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await API.get("/results/stats", {
          headers: { Authorization: `Bearer ${token}` }, 
        });
        setStats(data);
      } catch (err) {
        console.error("Erreur stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
          Tableau de bord
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Quiz réalisés
            </h2>
            <p className="text-5xl font-bold text-blue-600 text-center">
              {stats.quizzesDone}
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Score moyen
            </h2>
            <p className="text-5xl font-bold text-yellow-500 text-center">
              {stats.averageScore}%
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/quizzes"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1 transition duration-300"
          >
            Faire un nouveau quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
