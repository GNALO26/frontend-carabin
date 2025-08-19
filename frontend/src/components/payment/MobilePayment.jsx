// Copie dans frontend/src/components/payment/MobilePayment.jsx
import React from 'react';

const MobilePayment = ({ instructions }) => {
  // instructions: array de strings ou texte
  if (!instructions) return null;
  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h4 className="font-semibold mb-2">Instructions de paiement</h4>
      {Array.isArray(instructions) ? (
        <ol className="list-decimal pl-6">
          {instructions.map((ins, i) => <li key={i}>{ins}</li>)}
        </ol>
      ) : (
        <p>{instructions}</p>
      )}
      <p className="mt-2 text-sm text-gray-600">Après paiement, vous recevrez un code d'accès par email.</p>
    </div>
  );
};

export default MobilePayment;