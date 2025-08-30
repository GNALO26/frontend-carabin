// scripts/fixQuizQuestions.js
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
require('dotenv').config();

const fixQuizQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const quizzes = await Quiz.find({});
    console.log(`📊 ${quizzes.length} quizs à traiter`);

    for (const quiz of quizzes) {
      console.log(`\n🔍 Traitement du quiz: ${quiz.title}`);
      
      // Vérifier si le quiz a des questions en double
      const questionCount = quiz.questions.length;
      const uniqueQuestions = [];
      const seenQuestions = new Set();
      
      for (const question of quiz.questions) {
        const questionKey = question.text.trim().toLowerCase();
        if (!seenQuestions.has(questionKey)) {
          seenQuestions.add(questionKey);
          uniqueQuestions.push(question);
        }
      }
      
      // Si on a trouvé des doublons, mettre à jour le quiz
      if (uniqueQuestions.length !== questionCount) {
        console.log(`   ➖ ${questionCount - uniqueQuestions.length} questions en double supprimées`);
        quiz.questions = uniqueQuestions;
        await quiz.save();
        console.log(`   ✅ Quiz mis à jour avec ${uniqueQuestions.length} questions uniques`);
      } else {
        console.log(`   ✅ Aucune question en double trouvée`);
      }
    }

    console.log('\n🎉 Correction des questions terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  }
};

fixQuizQuestions();