import React from "react";
import { useParams } from "react-router-dom";

const GeneratedQuizPage = () => {
  const { fileName } = useParams();

  return (
    <div className="w-full h-screen">
      <iframe
        src={`/${decodeURIComponent(fileName)}`}
        title="QCM généré"
        className="w-full h-full border-0"
      />
    </div>
  );
};

export default GeneratedQuizPage;
