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
      const { data } = await API.get(`/quizzes/${id}`);
      setQuiz(data);
    } catch (err) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (id) {
        await API.put(`/quizzes/${id}`, quiz);
      } else {
        await API.post("/quizzes", quiz);
      }
      navigate("/admin/quizzes");
    } catch (err) {
      setError("Erreur lors de la sauvegarde du quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{id ? "Modifier" : "Créer"} un quiz</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

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

        <div className="flex gap-2">
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