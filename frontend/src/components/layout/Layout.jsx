import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Outlet />  {/* 🔥 Ici React Router injectera Home, Register, Login, etc. */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
