import React, { useState } from "react";

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "Quel est l’organe responsable de la production d’insuline ?",
      options: ["Foie", "Pancréas", "Rate", "Rein"],
      answer: "Pancréas",
    },
    {
      question: "Combien de chambres possède le cœur humain ?",
      options: ["2", "3", "4", "5"],
      answer: "4",
    },
  ];

  const handleAnswer = (option) => {
    if (option === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
    setCurrentQuestion(currentQuestion + 1);
  };

  return (
    <div className="container mx-auto p-6">
      {currentQuestion < questions.length ? (
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto">
          <h1 className="text-xl font-bold mb-4">
            {questions[currentQuestion].question}
          </h1>
          <div className="grid gap-3">
            {questions[currentQuestion].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="w-full bg-blue-100 text-blue-800 p-3 rounded-lg hover:bg-blue-200 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center bg-white shadow-lg rounded-xl p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">Résultat 🎉</h1>
          <p className="text-lg">
            Score : <span className="font-bold">{score}</span> /{" "}
            {questions.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
