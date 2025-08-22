import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700 flex items-center">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin/dashboard"
            className="block p-2 rounded hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/quizzes"
            className="block p-2 rounded hover:bg-gray-700 transition-colors"
          >
            Gérer les Quiz
          </Link>
          <Link
            to="/"
            className="block p-2 rounded hover:bg-gray-700 transition-colors mt-4"
          >
            Retour au site
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="p-4 bg-red-600 hover:bg-red-700 text-center transition-colors"
        >
          Déconnexion
        </button>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Espace Administrateur</h1>
          <div className="text-sm text-gray-500">
            Connecté en tant qu'administrateur
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;