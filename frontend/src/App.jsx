import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages publiques & utilisateurs
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import QuizListPage from './pages/QuizListPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import GeneratedQuizPage from './pages/GeneratedQuizPage';

// Pages Admin
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/DashboardPage';
import QuizEditor from './pages/admin/QuizEditor';
import QuizzesPage from './pages/admin/QuizzesPage';
import UsersPage from './pages/admin/UsersPage';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Routes sécurisées
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
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
            </Route>
          </Route>

          {/* --------- Layout Admin --------- */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/quizzes" element={<QuizzesPage />} />
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
  );
}

export default App;