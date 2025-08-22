import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />  {/* Les routes enfants seront injectées ici */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;