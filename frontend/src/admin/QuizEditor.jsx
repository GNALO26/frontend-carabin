import React, { useEffect, useState } from "react";
import QuizForm from "../components/QuizForm";
import api from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

const QuizEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/quizzes/${id}`);
        setInitial(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async (quiz) => {
    try {
      if (id) {
        await api.put(`/admin/quizzes/${id}`, quiz);
      } else {
        await api.post("/admin/quizzes", quiz);
      }
      navigate("/admin/quizzes");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  if (loading) return <div className="text-center p-6">Chargement...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">
          {id ? "✏️ Modifier le quiz" : "➕ Créer un quiz"}
        </h1>
        <QuizForm onSave={handleSave} initial={initial} />
      </div>
    </div>
  );
};

export default QuizEditor;
