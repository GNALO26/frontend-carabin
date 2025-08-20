import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-4 mt-10">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} <span className="font-semibold">Carabin Quiz</span>. 
        Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;