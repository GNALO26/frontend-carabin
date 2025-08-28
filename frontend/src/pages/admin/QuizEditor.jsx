import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

const QuizEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchQuiz = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const { data } = await API.get(`/admin/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement du quiz");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index].text = value;
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem('adminToken');
      if (id) {
        await API.put(`/admin/quizzes/${id}`, quiz, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await API.post("/admin/quizzes", quiz, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate("/admin/quizzes");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde du quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{id ? "Modifier" : "Créer"} un quiz</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Titre</label>
          <input
            type="text"
            name="title"
            value={quiz.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={quiz.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows="3"
          />
        </div>

        {quiz.questions?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mt-4">Questions</h2>
            {quiz.questions.map((q, idx) => (
              <div key={idx} className="border p-3 rounded">
                <label className="block text-gray-700 mb-1">Question {idx + 1}</label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => handleQuestionChange(idx, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/quizzes")}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizEditor;
