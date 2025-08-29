import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const PaymentPage = () => {
  const [amount] = useState(5000);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
  }, [currentUser, navigate]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!phone) {
        setError("Veuillez entrer votre numéro de téléphone");
        return;
      }

      const { data } = await API.post("/payment/initiate", {
        amount,
        description: "Abonnement Quiz de Carabin Premium",
        phone
      });

      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setError("Impossible de générer le lien de paiement");
      }
    } catch (err) {
      console.error("Erreur paiement:", err);
      setError(err.response?.data?.error || "Erreur lors de l'initialisation du paiement");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Passer à la version premium</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Avantages premium</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Accès à tous les quiz spécialisés</li>
            <li>Statistiques détaillées de progression</li>
            <li>Certificats de réussite</li>
            <li>Défis exclusifs</li>
          </ul>
        </div>

        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone (pour le paiement)
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: 2250123456789"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: 225 suivis de votre numéro (sans espaces)
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600">Montant à payer :</p>
          <p className="text-3xl font-bold text-blue-800">{amount} FCFA</p>
          <p className="text-sm text-gray-500">(valable pour 30 jours)</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !phone}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirection en cours...
            </>
          ) : (
            "Payer avec CinetPay"
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Vous serez redirigé vers la plateforme de paiement sécurisé CinetPay
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;