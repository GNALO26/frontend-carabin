import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import API from './services/api';

// Pages publiques & utilisateurs
import HomePage from './pages/HomePage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import QuizListPage from './pages/QuizListPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import GeneratedQuizPage from './pages/GeneratedQuizPage.jsx';

// Pages Admin
import AdminLoginPage from './pages/admin/LoginPage.jsx';
import AdminDashboard from './pages/admin/DashboardPage.jsx';
import QuizEditor from './pages/admin/QuizEditor.jsx';
import AdminQuizzesPage from './pages/admin/QuizzesPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';

// Layouts
import Layout from './components/layout/Layout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

// Routes sécurisées
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';

function App() {
  const [backendStatus, setBackendStatus] = useState('loading'); // 'loading', 'healthy', 'error'

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await API.get('/health');
        setBackendStatus('healthy');
      } catch (error) {
        console.error('Le backend est indisponible:', error);
        setBackendStatus('error');
      }
    };

    checkBackendHealth();
  }, []);

  // Si le backend est en erreur, afficher un message
  if (backendStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Service temporairement indisponible</h1>
          <p className="text-gray-600">Veuillez réessayer dans quelques instants.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* --------- Layout Public --------- */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/quizzes" element={<QuizListPage />} />
              <Route path="/quiz/:id" element={<QuizPage />} />
              <Route path="/generated/:fileName" element={<GeneratedQuizPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Routes utilisateur authentifié */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
              </Route>
            </Route>

            {/* --------- Layout Admin --------- */}
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

            {/* --------- 404 --------- */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;