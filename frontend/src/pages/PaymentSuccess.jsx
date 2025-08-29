import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transactionId) {
        setStatus("error");
        setMessage("Paramètres de paiement manquants");
        return;
      }

      try {
        const { data } = await API.post("/payment/verify", {
          transactionId
        });

        if (data.success) {
          setStatus("success");
          setMessage("Votre paiement a été traité avec succès");
          // Rafraîchir les informations utilisateur
          await refreshUser();
        } else {
          setStatus("error");
          setMessage(data.message || "Erreur lors du traitement de votre paiement");
        }
      } catch (error) {
        console.error("Erreur de vérification du paiement:", error);
        setStatus("error");
        setMessage(error.response?.data?.error || "Erreur lors de la vérification du paiement");
      }
    };

    verifyPayment();
  }, [transactionId, refreshUser]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">Échec du paiement</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/payment")}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Réessayer le paiement
            </button>
            <Link
              to="/dashboard"
              className="border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-800 mb-4">Paiement réussi !</h1>
        <p className="text-gray-600 mb-6">
          {message || "Merci pour votre achat. Votre compte a été mis à niveau vers la version premium."}
        </p>
        
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold text-green-800">Vous avez maintenant accès à :</h2>
          <ul className="text-left text-green-700 mt-2 space-y-1">
            <li>• Tous les quiz spécialisés</li>
            <li>• Statistiques détaillées</li>
            <li>• Certificats de réussite</li>
            <li>• Défis exclusifs</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/quizzes"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Explorer les quiz
          </Link>
          <Link
            to="/dashboard"
            className="border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Aller au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;