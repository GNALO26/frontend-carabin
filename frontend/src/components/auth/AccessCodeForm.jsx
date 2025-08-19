import React, { useState } from 'react';
import api from '../../services/api';

const AccessCodeForm = ({ onSubmit, loading = false }) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (onSubmit) return onSubmit(code.trim());
    try {
      await api.post('/auth/validate-access-code', { code: code.trim() });
      // si appel direct, on peut rafraîchir l'utilisateur
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Entrez votre code d'accès"
        className="w-full border rounded p-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Vérification...' : "Valider mon accès"}
      </button>
    </form>
  );
};

export default AccessCodeForm;
