import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Vérifier le statut du paiement
        await API.get("/payment/verify");
        
        // Mettre à jour le statut de l'utilisateur
        if (currentUser) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Erreur de vérification du paiement:", error);
      }
    };

    verifyPayment();
  }, [currentUser, refreshUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-800 mb-4">Paiement réussi !</h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre achat. Votre compte a été mis à niveau vers la version premium.
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