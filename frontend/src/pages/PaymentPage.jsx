import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const PaymentPage = () => {
  const [amount] = useState(5000);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  const handlePayment = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const transactionId = "TX" + Date.now();
      const { data } = await API.post("/payment/initiate", {
        amount,
        transactionId,
        description: "Achat de quiz premium",
        customer_email: currentUser.email,
        customer_id: currentUser._id
      });
      const paymentUrl = data?.payment_url || data?.data?.payment_url;
      if (paymentUrl) window.location.href = paymentUrl;
      else alert("Impossible de générer le lien de paiement");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'initialisation du paiement");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-6">Passer à la version premium</h2>
        <p className="text-3xl font-bold text-blue-800 mb-6">{amount} FCFA</p>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Redirection en cours..." : "Payer avec CinetPay"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
