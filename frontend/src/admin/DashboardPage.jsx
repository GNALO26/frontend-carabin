import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        const response = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': 'Bearer ${token}' } // Correction: backticks pour linterpolation
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tableau de Bord Administrateur</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
          }}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Déconnexion
        </button>
      </div>
      
      {isLoading ? (
        <div>Chargement des données...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Utilisateurs</h2>
              <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Abonnements Actifs</h2>
              <p className="text-3xl font-bold">{stats.activeSubscriptions || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Quiz</h2>
              <p className="text-3xl font-bold">{stats.totalQuizzes || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Revenus</h2>
              <p className="text-3xl font-bold">
                {stats.revenue?.[0]?.total ? formatCurrency(stats.revenue[0].total) : formatCurrency(0)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gestion des Quiz</h2>
                <button 
                  onClick={() => navigate('/admin/quizzes')}
                  className="text-blue-600 hover:underline"
                >
                  Voir tous
                </button>
              </div>
              {/* Liste réduite des quiz */}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Derniers Paiements</h2>
                <button 
                  onClick={() => navigate('/admin/payments')}
                  className="text-blue-600 hover:underline"
                >
                  Voir tous
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Utilisateur</th>
                    <th className="text-left">Montant</th>
                    <th className="text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments?.map(payment => (
                    <tr key={payment._id}>
                      <td>{payment.user?.name || 'Anonyme'}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>
                        <span className={`px-2 py-1 rounded ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'completed' ? 'Complété' : 
                           payment.status === 'pending' ? 'En attente' : 'Échoué'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;