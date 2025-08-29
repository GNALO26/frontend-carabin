// scripts/checkQuizzes.js
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
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkQuizzes();