import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await API.post("/auth/register", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Erreur lors de l'inscription. Veuillez réessayer.";
      setError(errorMessage);
      console.error("Erreur d'inscription:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Créer un compte</h1>
          <p className="text-gray-600">Rejoignez Carabin Quiz pour tester vos connaissances médicales</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="******** (min. 6 caractères)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              className="input-field"
              placeholder=""
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Création en cours...
              </div>
            ) : (
              "Créer un compte"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-8">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Connectez-vous
          </Link>
        </p>
        
        <footer className="footer">
          <p>© 2025 Quiz de Carabin. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default RegisterPage;