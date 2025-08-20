import React from "react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const fakeStats = {
    quizzesDone: 5,
    averageScore: 72,
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Tableau de bord</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Quiz réalisés</h2>
          <p className="text-4xl font-bold text-blue-700">
            {fakeStats.quizzesDone}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Score moyen</h2>
          <p className="text-4xl font-bold text-yellow-500">
            {fakeStats.averageScore}%
          </p>
        </div>
      </div>
      <div className="mt-10">
        <Link
          to="/quiz/1"
          className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition"
        >
          Faire un nouveau quiz
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
