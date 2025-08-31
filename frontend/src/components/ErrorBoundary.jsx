import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur s'est produite</h2>
            <p className="text-gray-600 mb-4">
              Désolé, quelque chose s'est mal passé. Veuillez rafraîchir la page.
            </p>
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-blue-600">Détails techniques</summary>
              <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-2 rounded">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo ? this.state.errorInfo.componentStack : 'Aucun détail supplémentaire'}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;