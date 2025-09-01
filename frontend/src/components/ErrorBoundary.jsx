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
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    window.location.reload();
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
            <button
              onClick={this.handleReset}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;