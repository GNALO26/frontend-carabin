import React, { useState, useEffect } from 'react';

const Countdown = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    
    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [timeLeft, onComplete]);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="text-xl font-bold">
      {minutes}:{seconds < 10 ? '0${seconds}' : seconds}
    </div>
  );
};

export default Countdown;