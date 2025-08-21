import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages publiques & utilisateurs
import HomePage from './pages/HomePage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import QuizListPage from './pages/QuizListPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
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
  );
}

export default App;