// Copie dans frontend/src/components/payment/PaymentForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import MobilePayment from './MobilePayment';

const PaymentForm = ({ amount = 1000 }) => {
  const [operator, setOperator] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/payment/initiate', { operator, phoneNumber: phone, amount });
      // Le backend renverra des instructions ou transactionId
      setInstructions(res.data.instructions || null);
      setMessage('Demande de paiement initiée. Suivez les instructions fournies.');
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.error || 'Erreur lors de l\'initiation du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label>Opérateur</label>
        <select value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full p-2 border rounded">
          <option value="mtn">MTN Mobile Money</option>
          <option value="moov">Moov Money</option>
          <option value="celtiis">Celtiis Money</option>
        </select>

        <label>Numéro mobile</label>
        <input className="w-full p-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} required />

        <div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? 'Traitement...' : `Payer ${amount} XOF`}
          </button>
        </div>
      </form>

      {instructions && <MobilePayment instructions={instructions} />}

      {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
    </div>
  );
};

export default PaymentForm;