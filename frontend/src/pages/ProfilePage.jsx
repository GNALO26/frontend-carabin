import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const ProfilePage = () => {
  const { user, logout, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.put('/users/me', formData);
      setSuccess('Profil mis à jour avec succès');
      refreshUserData(); // Rafraîchir les données utilisateur
      setIsEditing(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-12">Chargement du profil...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <Button variant="secondary" onClick={logout}>
            Déconnexion
          </Button>
        </div>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}
        
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600">Nom</label>
              <p className="text-lg">{user.name}</p>
            </div>
            
            <div>
              <label className="block text-gray-600">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            
            <div>
              <label className="block text-gray-600">Abonnement</label>
              <p className="text-lg">
                {user.subscription?.isActive 
                  ? "Premium jusqu'au ${new Date(user.subscription.expiryDate).toLocaleDateString()}"
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
              <label className="block text-gray-600 mb-1">Nom</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
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
  );
};

export default ProfilePage;