import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isDOMError: false
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      isDOMError: error instanceof DOMException || error.message.includes('removeChild')
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Envoyer l'erreur à un service de logging
    if (process.env.NODE_ENV === 'production') {
      // Utiliser un service comme Sentry ici
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Recharger la page pour les erreurs DOM critiques
    if (this.state.isDOMError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="text-red-500 text-6xl mb-4">⚠</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">Oups! Quelque chose s'est mal passé</h1>
            <p className="text-gray-600 mb-6">
              {this.state.isDOMError 
                ? "Une erreur d'interface s'est produite." 
                : "Une erreur inattendue s'est produite."}
            </p>
            
            {process.env.NODE_ENV !== 'production' && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-blue-600 mb-2">Détails de l'erreur</summary>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {this.state.isDOMError ? "Recharger la page" : "Réessayer"}
              </button>
              <button
                onClick={() => window.history.back()}
                className="border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;