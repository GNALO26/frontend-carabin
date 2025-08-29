const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
require('dotenv').config();

async function checkQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const quizzes = await Quiz.find({});
    console.log(`📊 ${quizzes.length} quizs trouvés dans la base:`);
    
    quizzes.forEach(quiz => {
      console.log(`- ${quiz.title} (${quiz.free ? 'Gratuit' : 'Payant'}) - ${quiz.questions.length} questions`);
      console.log(`  Catégorie: ${quiz.category}`);
    });

    // Vérifier les quizs gratuits
    const freeQuizzes = await Quiz.find({ free: true });
    console.log(`\n🎯 ${freeQuizzes.length} quizs gratuits:`);
    freeQuizzes.forEach(quiz => {
      console.log(`- ${quiz.title}`);
    });

    // Vérifier les quizs premium
    const premiumQuizzes = await Quiz.find({ free: false });
    console.log(`\n💎 ${premiumQuizzes.length} quizs premium:`);
    premiumQuizzes.forEach(quiz => {
      console.log(`- ${quiz.title}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkQuizzes();