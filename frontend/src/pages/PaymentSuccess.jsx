import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600">Paiement réussi ✅</h1>
        <p className="mt-4">Merci pour votre achat.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Aller au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
