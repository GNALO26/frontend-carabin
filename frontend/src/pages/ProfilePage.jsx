import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API, { createCancelToken } from '../services/api';
import Button from '../components/ui/Button';
import { useIsMounted } from '../hooks';

const ProfilePage = () => {
  const { user, logout, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isMounted = useIsMounted();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    let cancelTokenSource = null;
    
    try {
      cancelTokenSource = createCancelToken();
      
      const response = await API.put('/users/me', formData, {
        cancelToken: cancelTokenSource.token
      });
      
      if (isMounted.current) {
        setSuccess('Profil mis à jour avec succès');
        refreshUserData();
        setIsEditing(false);
      }
    } catch (err) {
      if (isMounted.current && !axios.isCancel(err)) {
        setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
    
    return () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel("Requête annulée");
      }
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
            <Button variant="secondary" onClick={logout}>
              Déconnexion
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
              {success}
            </div>
          )}
          
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom</label>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Abonnement</label>
                <p className="text-lg text-gray-900">
                  {user.subscription?.isActive 
                    ? `Premium jusqu'au ${new Date(user.subscription.expiryDate).toLocaleDateString()}`
                    : 'Accès standard'}
                </p>
              </div>
              
              <Button onClick={() => setIsEditing(true)}>
                Modifier le profil
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;