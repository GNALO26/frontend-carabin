import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${widthClass}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;