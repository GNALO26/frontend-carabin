// frontend/src/pages/QuizListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const QuizListPage = () => {
  const [freeQuiz, setFreeQuiz] = useState([]);
  const [premiumQuizzes, setPremiumQuizzes] = useState([]);
  const [generatedQuizzes, setGeneratedQuizzes] = useState([]); // ✅ Ajout
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Récupérer quiz MongoDB
        const freeRes = await API.get("/quiz/free");
        setFreeQuiz(freeRes.data);

        const premiumRes = await API.get("/quiz/premium");
        setPremiumQuizzes(premiumRes.data);

        // ✅ Récupérer les QCM générés
        const generatedRes = await API.get("/quizzes");
        setGeneratedQuizzes(generatedRes.data);
      } catch (err) {
        setError("Impossible de charger les quiz. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="quiz-list">
      <h2>Quiz disponibles</h2>

      {/* ✅ Section Quiz gratuit */}
      <section>
        <h3>Quiz Gratuit</h3>
        {freeQuiz.length === 0 ? (
          <p>Aucun quiz gratuit disponible pour le moment.</p>
        ) : (
          freeQuiz.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <h4>{quiz.title}</h4>
              <p>{quiz.description}</p>
              <button onClick={() => navigate(`/quiz/${quiz._id}`)}>
                Commencer
              </button>
            </div>
          ))
        )}
      </section>

      {/* ✅ Section Quiz premium */}
      <section>
        <h3>Quiz Premium</h3>
        {premiumQuizzes.length === 0 ? (
          <p>Aucun quiz premium disponible pour le moment.</p>
        ) : (
          premiumQuizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card premium">
              <h4>{quiz.title}</h4>
              <p>{quiz.description}</p>
              <button onClick={() => navigate(`/quiz/${quiz._id}`)}>
                Commencer
              </button>
            </div>
          ))
        )}
      </section>

      {/* ✅ Section Quiz générés automatiquement */}
      <section>
        <h3>Quiz générés depuis documents</h3>
        {generatedQuizzes.length === 0 ? (
          <p>Aucun QCM généré pour le moment.</p>
        ) : (
          generatedQuizzes.map((file, idx) => (
            <div key={idx} className="quiz-card generated">
              <h4>{file.replace(".html", "")}</h4>
              <button
                onClick={() => navigate(`/generated/${encodeURIComponent(file)}`)}
              >
                Ouvrir
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default QuizListPage;
