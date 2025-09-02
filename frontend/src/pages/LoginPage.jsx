import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useIsMounted } from "../hooks";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const isMounted = useIsMounted();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isMounted.current) return;

    try {
      setLoading(true);
      setError("");

      // Utiliser la fonction login du contexte d'authentification
      const result = await login(formData);

      if (result.success) {
        // Redirection gérée par l'effet useEffect ci-dessus
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError(err.message || "Erreur de connexion. Vérifiez vos identifiants.");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
            Connexion
          </h2>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                placeholder=""
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-8">
            Pas encore de compte ?{" "}
            <Link 
              to="/register" 
              className="text-blue-600 font-semibold hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register", { 
                  state: { from: location.state?.from || { pathname: "/" } } 
                });
              }}
            >
              Créez-en un
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;