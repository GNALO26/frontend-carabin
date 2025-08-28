const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB', err);
    process.exit(1);
  });

// Fonction pour scanner récursivement les dossiers
function findDocxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findDocxFiles(filePath, fileList);
    } else if (path.extname(file) === '.docx') {
      fileList.push({
        path: filePath,
        category: path.basename(path.dirname(filePath)),
        free: true
      });
    }
  });
  
  return fileList;
}

// Fonction pour parser les fichiers DOCX
async function parseDocxFile(filePath, category, isFree = true) {
  try {
    const { value } = await mammoth.extractRawText({ path: filePath });
    const lines = value.split('\n').map(l => l.trim()).filter(Boolean);

    const quizzes = [];
    let currentQuiz = null;
    let currentQuestion = null;
    let inJustification = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('titre:')) {
        if (currentQuiz) quizzes.push(currentQuiz);
        currentQuiz = {
          title: line.split(':').slice(1).join(':').trim(),
          description: '',
          category: category,
          free: isFree,
          questions: []
        };
        inJustification = false;
      }
      else if (line.toLowerCase().includes('description')) {
        if (currentQuiz) {
          currentQuiz.description = line.split(':').slice(1).join(':').trim();
        }
        inJustification = false;
      }
      else if (line.toLowerCase().includes('question')) {
        if (currentQuiz) {
          const questionText = line.split(':').slice(1).join(':').trim();
          if (questionText) {
            currentQuestion = {
              text: questionText,
              options: [],
              correctAnswers: [],
              explanation: ''
            };
            currentQuiz.questions.push(currentQuestion);
          }
        }
        inJustification = false;
      }
      else if (/^[a-e][).\s]/i.test(line)) {
        if (currentQuestion && !inJustification) {
          const optionText = line.substring(2).trim();
          if (optionText) {
            currentQuestion.options.push(optionText);
          }
        }
      }
      else if (line.toLowerCase().includes('réponse:')) {
        if (currentQuestion) {
          const answerPart = line.split(':').slice(1).join(':').trim();
          const answers = answerPart.split(',').map(a => a.trim().toLowerCase());
          currentQuestion.correctAnswers = answers.map(a => 'abcde'.indexOf(a.charAt(0)));
          inJustification = false;
        }
      }
      else if (line.toLowerCase().includes('justification:')) {
        if (currentQuestion) {
          currentQuestion.explanation = line.split(':').slice(1).join(':').trim();
          inJustification = true;
        }
      }
      else if (inJustification && currentQuestion) {
        currentQuestion.explanation += ' ' + line;
      }
    }

    if (currentQuiz) quizzes.push(currentQuiz);
    return quizzes;
  } catch (error) {
    console.error('❌ Erreur parsing DOCX:', error);
    return [];
  }
}

// Fonction principale
async function seedFromDocx() {
  try {
    console.log('🗑 Suppression des anciens quizzes...');
    await Quiz.deleteMany({});
    console.log('✅ Anciens quizzes supprimés');

    // Trouver tous les fichiers DOCX
    const uploadsDir = path.join(__dirname, '../uploads');
    const docxFiles = findDocxFiles(uploadsDir);
    
    console.log(`📁 ${docxFiles.length} fichiers DOCX trouvés`);

    let totalQuizzes = 0;
    let totalQuestions = 0;

    // Traiter chaque fichier
    for (const config of docxFiles) {
      if (fs.existsSync(config.path)) {
        console.log(`\n📖 Lecture de ${path.basename(config.path)} (Catégorie: ${config.category})`);
        const quizzes = await parseDocxFile(config.path, config.category, config.free);
        
        if (quizzes.length > 0) {
          await Quiz.insertMany(quizzes);
          console.log(`✅ ${quizzes.length} quizzes ajoutés`);
          
          totalQuizzes += quizzes.length;
          quizzes.forEach(quiz => {
            totalQuestions += quiz.questions.length;
          });
        } else {
          console.log('❌ Aucun quiz trouvé dans ce fichier');
        }
      } else {
        console.log(`❌ Fichier non trouvé: ${path.basename(config.path)}`);
      }
    }

    console.log('\n🎉 Base de données peuplée avec succès!');
    console.log(`📊 ${totalQuizzes} quizzes et ${totalQuestions} questions ajoutés`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Exécution
seedFromDocx();