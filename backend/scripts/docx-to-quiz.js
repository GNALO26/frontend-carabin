// backend/scripts/docx-to-quiz.js
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const uploadsDir = path.join(__dirname, "../uploads");
const outputDir = path.join(__dirname, "../public");

// ✅ Template HTML (responsive + design demandé)
const template = (title, questionsHTML) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
      :root {
          --primary: #4361ee;
          --success: #2ecc71;
          --danger: #e74c3c;
          --light: #f8f9fa;
          --dark: #212529;
          --gray: #6c757d;
          --border: #dee2e6;
      }
      body { font-family: 'Segoe UI', sans-serif; background: #f5f7fb; margin: 0; padding: 20px; }
      .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; padding: 20px; }
      header { text-align: center; margin-bottom: 20px; }
      header h1 { color: var(--primary); margin-bottom: 5px; }
      header p { color: var(--gray); }
      .question { margin-bottom: 25px; padding: 15px; border: 1px solid var(--border); border-radius: 10px; background: var(--light); }
      .question-text { font-weight: bold; margin-bottom: 12px; color: var(--dark); }
      .options { margin-left: 15px; }
      .option { margin-bottom: 8px; }
      .answer { margin-top: 10px; font-weight: 600; color: var(--primary); }
      .justification { margin-top: 6px; font-style: italic; color: var(--gray); padding: 8px; background: #f9f9f9; border-left: 3px solid var(--success); }
      footer { text-align: center; font-size: 13px; color: var(--gray); margin-top: 30px; }
      @media (max-width: 600px) {
        body { padding: 10px; }
        .container { padding: 15px; }
      }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${title}</h1>
      <p>QCM généré automatiquement</p>
    </header>
    <main>
      ${questionsHTML}
    </main>
    <footer>© 2025 Carabin Quiz</footer>
  </div>
</body>
</html>
`;

async function convertDocx(filePath) {
  const fileName = path.basename(filePath, ".docx");
  const outputFile = path.join(outputDir, `${fileName}.html`);

  console.log(`📖 Lecture du document : ${filePath}`);

  const { value } = await mammoth.extractRawText({ path: filePath });
  const lines = value.split("\n").map(l => l.trim()).filter(Boolean);

  let htmlQuestions = "";
  let qCount = 0;
  let currentQuestion = "";
  let currentOptions = [];
  let currentAnswer = "";
  let currentJustification = "";

  function flushQuestion() {
    if (!currentQuestion) return;

    const answers = currentAnswer.split(",").map(a => a.trim().toLowerCase()).filter(Boolean);
    const multiple = answers.length > 1;

    const optionsHTML = currentOptions.map(opt => {
      const letter = opt[0].toLowerCase();
      return `
        <div class="option">
          <input type="${multiple ? "checkbox" : "radio"}" name="q${qCount}" value="${letter}">
          <label>${opt}</label>
        </div>`;
    }).join("");

    htmlQuestions += `
      <div class="question">
        <div class="question-text">${currentQuestion}</div>
        <div class="options">${optionsHTML}</div>
        <div class="answer">Réponse : ${currentAnswer}</div>
        ${currentJustification ? `<div class="justification">${currentJustification}</div>` : ""}
      </div>
    `;

    currentQuestion = "";
    currentOptions = [];
    currentAnswer = "";
    currentJustification = "";
  }

  for (let line of lines) {
    if (/^Question\s*\d+/i.test(line)) {
      flushQuestion();
      qCount++;
      currentQuestion = line;
    } else if (/^[a-e][\)\.]/i.test(line)) {
      currentOptions.push(line);
    } else if (/^Réponse\s*:/i.test(line)) {
      currentAnswer = line.split(":")[1].trim();
    } else if (/^Justification\s*:/i.test(line)) {
      currentJustification = line.split(":")[1].trim();
    }
  }
  flushQuestion();

  if (!htmlQuestions) throw new Error("⚠️ Aucune question détectée dans ce fichier.");

  const finalHTML = template(`QCM - ${fileName}`, htmlQuestions);
  fs.writeFileSync(outputFile, finalHTML, "utf8");

  console.log(`✅ QCM généré : ${outputFile}`);
}

(async () => {
  try {
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith(".docx"));
    if (files.length === 0) {
      console.log("⚠️ Aucun fichier DOCX trouvé dans uploads/");
      return;
    }
    for (let file of files) {
      await convertDocx(path.join(uploadsDir, file));
    }
    console.log("🎉 Tous les fichiers ont été convertis avec succès !");
  } catch (err) {
    console.error("❌ Erreur :", err.message);
  }
})();
