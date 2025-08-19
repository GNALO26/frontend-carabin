import React from 'react';

const PaymentStatusBadge = ({ status }) => {
  let bgColor = '';
  let text = '';
  
  switch (status) {
    case 'completed':
      bgColor = 'bg-green-100 text-green-800';
      text = 'Completed';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100 text-yellow-800';
      text = 'Pending';
      break;
    case 'failed':
      bgColor = 'bg-red-100 text-red-800';
      text = 'Failed';
      break;
    default:
      bgColor = 'bg-gray-100 text-gray-800';
      text = status;
  }
  
  return (
    <span className={'px-2 py-1 rounded-full text-xs ${bgColor}'}>
      {text}
    </span>
  );
};

export default PaymentStatusBadge;