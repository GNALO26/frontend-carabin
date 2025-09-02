import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import paymentService, { formatPhoneNumber, validatePhoneNumber } from "../services/payment";
import { useIsMounted } from "../hooks";

const PaymentPage = () => {
  const [amount] = useState(5000);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMounted = useIsMounted();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Valider le numéro de téléphone à chaque changement
    if (phone) {
      const validation = validatePhoneNumber(phone);
      setIsValidPhone(validation.valid);
      
      if (!validation.valid && phone.length > 3) {
        setError(validation.message);
      } else if (validation.valid) {
        setError("");
      }
    } else {
      setIsValidPhone(false);
      setError("");
    }
  }, [phone]);

  useEffect(() => {
    return () => {
      // Annuler la requête en cours si le composant est démonté
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!isMounted.current) return;
    
    // Créer un nouveau AbortController pour cette requête
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      setLoading(true);
      setError("");

      if (!phone) {
        setError("Veuillez entrer votre numéro de téléphone");
        return;
      }

      const validation = validatePhoneNumber(phone);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      const formattedPhone = formatPhoneNumber(phone);

      // Appel API pour initier le paiement avec PayDunya
      const result = await paymentService.initiatePayment({
        amount: amount,
        description: "Abonnement Quiz de Carabin Premium",
        phone: formattedPhone
      });

      if (result.success && result.payment_url) {
        // Rediriger vers PayDunya
        window.location.href = result.payment_url;
      } else {
        setError(result.error || "Impossible de générer le lien de paiement");
      }
    } catch (err) {
      if (err.name === 'CanceledError') {
        console.log('Requête annulée');
        return;
      }
      console.error("Erreur paiement:", err);
      setError(err.message || "Erreur lors de l'initialisation du paiement");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Passer à la version premium</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Avantages premium</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Accès à tous les quiz spécialisés</li>
            <li>Statistiques détaillées de progression</li>
            <li>Certificats de réussite</li>
            <li>Défis exclusifs</li>
            <li>Sans publicité</li>
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
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 11) {
                setPhone(value);
              }
            }}
            placeholder="Ex: 22961234567 ou 061234567"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Formats acceptés: 22961234567 (11 chiffres) ou 061234567 (9 chiffres)
          </p>
          {phone && !isValidPhone && (
            <p className="text-xs text-red-500 mt-1">
              Format invalide. Utilisez: 22961234567 ou 061234567
            </p>
          )}
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-600">Montant à payer :</p>
          <p className="text-3xl font-bold text-blue-800">{amount} FCFA</p>
          <p className="text-sm text-gray-500">(valable pour 30 jours)</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !isValidPhone}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            "Payer avec PayDunya"
          )}
        </button>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Information importante</h3>
          <p className="text-sm text-yellow-700">
            Après le paiement, vous serez automatiquement redirigé vers notre site. 
            Si ce n'est pas le cas, merci de rafraîchir la page pour activer votre abonnement.
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Vous serez redirigé vers la plateforme de paiement sécurisé PayDunya
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;