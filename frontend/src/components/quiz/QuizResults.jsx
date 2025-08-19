import React from 'react';

const QuizResults = ({ result, quiz }) => {
  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (result.answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const score = calculateScore();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Résultats du Quiz</h2>
      
      <div className="text-center mb-8">
        <div className="text-4xl font-bold mb-2">{score}%</div>
        <div className="text-lg">
          {score >= 80 ? 'Excellent!' : 
           score >= 60 ? 'Bien joué!' : 
           'Peut mieux faire...'}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={index} className={`p-4 rounded-lg ${
            result.answers[index] === question.correctAnswer 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-medium mb-2">Question {index + 1}: {question.text}</h3>
            
            <div className="mb-3">
              <p className="font-medium">Votre réponse:</p>
              <p>{question.options[result.answers[index]] || 'Aucune réponse'}</p>
            </div>
            
            {result.answers[index] !== question.correctAnswer && (
              <div className="mb-3">
                <p className="font-medium">Bonne réponse:</p>
                <p>{question.options[question.correctAnswer]}</p>
              </div>
            )}
            
            {question.explanation && (
              <div>
                <p className="font-medium">Explication:</p>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={() => window.location.href = '/quizzes'}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Voir d'autres quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResults;