import React from 'react';

const ProgressTracker = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full" 
        style={{ width: '${percentage}%' }}
      ></div>
    </div>
  );
};

export default ProgressTracker;