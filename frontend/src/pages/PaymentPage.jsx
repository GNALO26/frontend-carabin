import React, { useState } from "react";
import API from "../api"; // ton axios configuré

const PaymentPage = () => {
  const [amount] = useState(5000); // ex: 5000 CFA
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // ID unique transaction
      const transactionId = "TX" + Date.now();

      const { data } = await API.post("/payment/initiate", {
        amount,
        transactionId,
        description: "Achat de quiz premium",
      });

      if (data?.data?.payment_url) {
        window.location.href = data.data.payment_url; // redirection vers CinetPay
      } else {
        alert("Impossible de générer le lien de paiement");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Paiement</h2>
        <p className="mb-6 text-gray-600 text-center">
          Montant à payer : <span className="font-semibold">{amount} CFA</span>
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Redirection en cours..." : "Payer avec CinetPay"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
