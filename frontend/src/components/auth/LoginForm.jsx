// Copie dans frontend/src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';

const LoginForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err?.response?.data?.error || 'Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block">Mot de passe</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
        Se connecter
      </button>
    </form>
  );
};

export default LoginForm;
