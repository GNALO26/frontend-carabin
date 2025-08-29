import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

const PaymentPage = () => {
  const [paymentStep, setPaymentStep] = useState('init');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const { user } = useAuth();

  const handlePaymentInit = async (data) => {
    try {
      setIsProcessing(true);
      setError('');
      
      const response = await API.post('/payment/initiate', {
        operator: data.operator,
        phoneNumber: data.phoneNumber,
        amount: data.amount,
        email: user.email
      });

      if (response.data.success) {
        setPaymentData({
          operator: data.operator,
          phoneNumber: data.phoneNumber,
          amount: data.amount,
          operatorConfig: response.data.operatorConfig,
          paymentId: response.data.paymentId,
          paymentUrl: response.data.payment_url
        });
        
        setPaymentStep('instructions');
      } else {
        throw new Error(response.data.error || "Erreur d'initialisation");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Erreur d'initialisation");
    } finally {
      setIsProcessing(false);
    }
  };

  // Autres fonctions et rendu JSX...
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Paiement</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {paymentStep === 'init' && (
          <PaymentForm 
            onSubmit={handlePaymentInit} 
            isProcessing={isProcessing}
          />
        )}
        
        {paymentStep === 'instructions' && paymentData && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <PaymentInstructions 
              operatorConfig={paymentData.operatorConfig}
              amount={paymentData.amount}
              paymentUrl={paymentData.paymentUrl}
            />
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setPaymentStep('init')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Retour
              </button>
              
              <button
                onClick={() => window.location.href = paymentData.paymentUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Payer maintenant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composants PaymentForm et PaymentInstructions (à adapter selon votre implémentation)
const PaymentForm = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState({
    operator: '',
    phoneNumber: '',
    amount: 5000
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opérateur
        </label>
        <select
          value={formData.operator}
          onChange={(e) => setFormData({...formData, operator: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Sélectionnez un opérateur</option>
          <option value="mtn">MTN</option>
          <option value="orange">Orange</option>
          <option value="moov">Moov</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="2250123456789"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Montant (FCFA)
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? 'Traitement...' : 'Initialiser le paiement'}
      </button>
    </form>
  );
};

const PaymentInstructions = ({ operatorConfig, amount, paymentUrl }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Instructions de paiement</h2>
      <p className="mb-4">
        Veuillez effectuer un paiement de {amount} FCFA via {operatorConfig?.name || 'votre opérateur'}.
      </p>
      
      {operatorConfig?.instructions && (
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <h3 className="font-semibold mb-2">Instructions spécifiques:</h3>
          <p>{operatorConfig.instructions}</p>
        </div>
      )}
      
      <p className="text-sm text-gray-600">
        Après le paiement, vous serez redirigé automatiquement vers la plateforme de confirmation.
      </p>
    </div>
  );
};

export default PaymentPage;