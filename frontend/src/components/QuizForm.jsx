// Copie dans frontend/src/components/QuizForm.jsx
import React, { useState } from 'react';

const QuizForm = ({ onSave, initial = null }) => {
  const [quiz, setQuiz] = useState(
    initial || { title: '', description: '', duration: 600, questions: [] }
  );
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const addQuestion = () => {
    if (!questionText.trim()) return;
    const q = {
      text: questionText,
      choices: choices.map((c) => c.trim()),
      correctIndex
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, q] });
    setQuestionText('');
    setChoices(['', '', '', '']);
    setCorrectIndex(0);
  };

  const handleSave = () => {
    if (onSave) onSave(quiz);
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Titre du quiz</label>
        <input
          className="w-full p-2 border rounded"
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          className="w-full p-2 border rounded"
          value={quiz.description}
          onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
        />
      </div>

      <div>
        <label>Durée (secondes)</label>
        <input
          type="number"
          className="w-full p-2 border rounded"
          value={quiz.duration}
          onChange={(e) => setQuiz({ ...quiz, duration: Number(e.target.value) })}
        />
      </div>

      <hr />

      <div>
        <label>Question</label>
        <input
          className="w-full p-2 border rounded"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {choices.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="flex-1 p-2 border rounded"
              value={c}
              onChange={(e) => {
                const next = [...choices];
                next[i] = e.target.value;
                setChoices(next);
              }}
            />
            <label>
              <input
                type="radio"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
              />{' '}
              Correct
            </label>
          </div>
        ))}
      </div>

      <button onClick={addQuestion} className="bg-blue-600 text-white py-1 px-3 rounded">
        Ajouter la question
      </button>

      <div>
        <h4 className="font-semibold">Questions ajoutées</h4>
        <ul className="list-disc pl-6">
          {quiz.questions.map((q, idx) => (
            <li key={idx}>
              {q.text} — {q.choices.join(' | ')}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-4 rounded">
          Enregistrer le quiz
        </button>
      </div>
    </div>
  );
};

export default QuizForm;