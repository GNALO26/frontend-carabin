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
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin/dashboard"
            className="block p-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/quizzes"
            className="block p-2 rounded hover:bg-gray-700"
          >
            Gérer les Quiz
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="p-4 bg-red-600 hover:bg-red-700 text-center"
        >
          Déconnexion
        </button>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Espace Administrateur</h1>
        </header>

        {/* Contenu */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
