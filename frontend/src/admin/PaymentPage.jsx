// ... (imports)

const PaymentPage = () => {
  // ... (états existants)

  const handlePaymentInit = async (data) => {
    try {
      setIsProcessing(true);
      setError('');
      
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator: data.operator,
          phoneNumber: data.phoneNumber,
          amount: data.amount,
          email: user.email
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur d'initialisation");

      setPaymentData({
        operator: data.operator,
        phoneNumber: data.phoneNumber,
        amount: data.amount,
        operatorConfig: result.operatorConfig,
        paymentId: result.paymentId
      });
      
      setPaymentStep('instructions');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ... (reste du code)

return (
  <>
    {/* ... (JSX existant) */}

    {paymentStep === 'instructions' && paymentData && (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <PaymentInstructions 
          operatorConfig={paymentData.operatorConfig}
          amount={paymentData.amount}
        />
        
        {/* ... (boutons existants) */}
      </div>
    )}
  </>
);
};
