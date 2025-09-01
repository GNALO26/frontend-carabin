// services/retryService.js
class RetryService {
  constructor() {
    this.pendingRequests = [];
    this.isProcessing = false;
  }

  addRequest(requestFn, key, maxRetries = 3) {
    this.pendingRequests.push({ requestFn, key, retries: 0, maxRetries });
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.pendingRequests.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests[0];
      
      try {
        await request.requestFn();
        this.pendingRequests.shift(); // Supprimer la requête réussie
      } catch (error) {
        request.retries++;
        
        if (request.retries >= request.maxRetries) {
          console.error(`Échec de la requête après ${request.maxRetries} tentatives:`, request.key);
          this.pendingRequests.shift(); // Supprimer la requête après max retries
        } else {
          // Déplacer la requête à la fin de la file d'attente
          this.pendingRequests.push(this.pendingRequests.shift());
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, request.retries) * 1000)
          );
        }
      }
    }
    
    this.isProcessing = false;
  }
}

export default new RetryService();