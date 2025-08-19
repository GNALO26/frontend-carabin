import React from 'react';

const Question = ({ question, onAnswer, selectedAnswer }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4">{question.text}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              name={'answer-${question.id}'}
              checked={selectedAnswer === index}
              onChange={() => onAnswer(index)}
              className="mr-2"
            />
            <span>{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Question;