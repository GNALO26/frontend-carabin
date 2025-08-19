import React from 'react';

const Alert = ({ type, message }) => {
  let bgColor = '';
  let textColor = '';
  
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
    case 'warning':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      break;
    default:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
  }
  
  return (
    <div className={'p-3 rounded-lg ${bgColor} ${textColor}'}>
      {message}
    </div>
  );
};

export default Alert;