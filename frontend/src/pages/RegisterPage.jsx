import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      setError("❌ Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur lors de l’inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-200 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg fade-in">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Créer un compte
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Nom complet</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Adresse email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirmer le mot de passe</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Création en cours..." : "Créer un compte"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
