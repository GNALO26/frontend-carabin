import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api"; // axios configuré vers ton backend

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // ✅ Envoi correct au backend
      const { data } = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-200 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg fade-in">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Connexion
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Adresse e-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="exemple@email.com"
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
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Créez-en un
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
