import { useEffect } from 'react';
import retryService from '../services/retryService';
import API from '../services/api';

const RetryFailedRequests = () => {
  useEffect(() => {
    const retryPendingResults = async () => {
      try {
        const pendingResults = JSON.parse(localStorage.getItem('pendingQuizResults') || '[]');
        
        for (const result of pendingResults) {
          const requestKey = `pending-result-${result.quizId}-${result.timestamp}`;
          
          const saveRequest = async () => {
            await API.post('/results', {
              quizId: result.quizId,
              score: result.score,
              totalQuestions: result.totalQuestions,
              answers: result.answers,
              timeTaken: result.timeTaken
            });
            
            // Supprimer de la liste en cas de succès
            const updatedResults = pendingResults.filter(r => 
              r.timestamp !== result.timestamp
            );
            localStorage.setItem('pendingQuizResults', JSON.stringify(updatedResults));
          };
          
          retryService.addRequest(saveRequest, requestKey, 3);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des résultats en attente:", error);
      }
    };

    const retryPendingPayments = async () => {
      try {
        const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
        
        for (const payment of pendingPayments) {
          const requestKey = `pending-payment-${payment.timestamp}`;
          
          const paymentRequest = async () => {
            // Réessayer l'initiation du paiement
            const { data } = await API.post("/payment/initiate", {
              amount: payment.amount,
              description: payment.description,
              phone: payment.phone
            });
            
            if (data.success && data.payment_url) {
              // Ouvrir dans une nouvelle fenêtre
              const newWindow = window.open(data.payment_url, '_blank');
              if (newWindow) {
                // Supprimer de la liste en cas de succès
                const updatedPayments = pendingPayments.filter(p => 
                  p.timestamp !== payment.timestamp
                );
                localStorage.setItem('pendingPayments', JSON.stringify(updatedPayments));
              }
            }
          };
          
          retryService.addRequest(paymentRequest, requestKey, 3);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des paiements en attente:", error);
      }
    };

    // Exécuter au chargement du composant et toutes les 5 minutes
    retryPendingResults();
    retryPendingPayments();
    const interval = setInterval(() => {
      retryPendingResults();
      retryPendingPayments();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null; // Ce composant n'a pas d'interface utilisateur
};

export default RetryFailedRequests;