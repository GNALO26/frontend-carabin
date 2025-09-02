import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import API from './services/api';
import RetryFailedRequests from './components/RetryFailedRequests';

// Pages publiques & utilisateurs
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import QuizListPage from './pages/QuizListPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import GeneratedQuizPage from './pages/GeneratedQuizPage';

// Pages Admin
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/DashboardPage';
import QuizEditor from './pages/admin/QuizEditor';
import AdminQuizzesPage from './pages/admin/QuizzesPage';
import UsersPage from './pages/admin/UsersPage';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Routes sécurisées
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Hooks personnalisés
import { useIsMounted, useSafeTimeout } from './hooks';

function App() {
  const [backendStatus, setBackendStatus] = useState('loading');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isMounted = useIsMounted();
  const { safeSetTimeout, safeClearTimeout } = useSafeTimeout();

  useEffect(() => {
    let isActive = true;

    const checkBackendHealth = async () => {
      try {
        await API.get('/health');
        if (isActive && isMounted.current) {
          setBackendStatus('healthy');
        }
      } catch (error) {
        if (error.code === 'ERR_CANCELED') return; // Ignorer les erreurs d'annulation
        console.error('Le backend est indisponible:', error);
        if (isActive && isMounted.current) {
          setBackendStatus('error');
        }
      }
    };

    // Vérifier la connexion internet
    const handleOnline = () => {
      if (isActive && isMounted.current) {
        setIsOnline(true);
        checkBackendHealth();
      }
    };
    
    const handleOffline = () => {
      if (isActive && isMounted.current) {
        setIsOnline(false);
        setBackendStatus('error');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkBackendHealth();
    
    const healthCheckInterval = safeSetTimeout(() => {
      checkBackendHealth();
    }, 60000);

    return () => {
      isActive = false;
      safeClearTimeout(healthCheckInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMounted, safeSetTimeout, safeClearTimeout]);

  if (backendStatus === 'error' || !isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {!isOnline ? 'Connexion internet perdue' : 'Service temporairement indisponible'}
          </h1>
          <p className="text-gray-600">
            {!isOnline 
              ? 'Veuillez vérifier votre connexion internet et réessayer.' 
              : 'Veuillez réessayer dans quelques instants.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (backendStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <RetryFailedRequests />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/quizzes" element={<QuizListPage />} />
              <Route path="/quiz/:id" element={<QuizPage />} />
              <Route path="/generated/:fileName" element={<GeneratedQuizPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
              </Route>
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
                <Route path="/admin/quizzes/new" element={<QuizEditor />} />
                <Route path="/admin/quizzes/edit/:id" element={<QuizEditor />} />
                <Route path="/admin/users" element={<UsersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;