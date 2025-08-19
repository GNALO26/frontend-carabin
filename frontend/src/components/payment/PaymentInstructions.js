import React from 'react';

const PaymentInstructions = ({ operatorConfig, amount }) => {
  // Fonction de formatage du montant
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-blue-800 mb-4">
        Instructions de paiement - {operatorConfig.name}
      </h3>
      
      <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Montant à payer</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatAmount(amount)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Numéro à payer</p>
            <p className="text-xl font-semibold">
              {operatorConfig.merchantNumber}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Étapes à suivre:</h4>
        <ol className="space-y-2">
          {operatorConfig.paymentSteps.map((step, index) => (
            <li key={index} className="flex">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Après paiement, cliquez sur "J'ai effectué le paiement".
              Votre code d'accès sera envoyé par email après confirmation.
            </p>
          </div>
        </div>
      </div>
      
      {operatorConfig.contact && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Besoin d'aide? {operatorConfig.contact}
        </div>
      )}
    </div>
  );
};

export default PaymentInstructions;