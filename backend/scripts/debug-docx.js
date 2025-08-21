const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const inputFile = path.join(__dirname, "../uploads/PHYSIO. RÉNALE_104908.docx");
const debugFile = path.join(__dirname, "../debug-output.txt");

(async () => {
  try {
    console.log("📖 Lecture du document :", inputFile);
    const { value } = await mammoth.extractRawText({ path: inputFile });

    // Nettoyage basique : trim + normalisation des espaces
    const cleanText = value
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .join("\n");

    fs.writeFileSync(debugFile, cleanText, "utf8");
    console.log("✅ Texte brut extrait et sauvegardé dans :", debugFile);
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
})();
