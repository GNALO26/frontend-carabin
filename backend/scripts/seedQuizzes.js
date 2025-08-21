// backend/scripts/seedQuizzes.js
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Données des quiz
const sampleQuizzes = [
  {
    title: "Anatomie du cœur",
    description: "Testez vos connaissances sur l'anatomie cardiaque",
    category: "cardiologie",
    difficulty: "moyen",
    free: true,
    questions: [
      {
        text: "Quelle est la chambre du cœur qui reçoit le sang oxygéné des poumons?",
        options: ["Oreillette droite", "Oreillette gauche", "Ventricule droit", "Ventricule gauche"],
        correctAnswer: 1,
        explanation: "L'oreillette gauche reçoit le sang oxygéné des poumons via les veines pulmonaires."
      },
      {
        text: "Quelle valve sépare l'oreillette droite du ventricule droit?",
        options: ["Valve mitrale", "Valve tricuspide", "Valve aortique", "Valve pulmonaire"],
        correctAnswer: 1,
        explanation: "La valve tricuspide sépare l'oreillette droite du ventricule droit."
      }
    ]
  },
  {
    title: "Pharmacologie de base",
    description: "Questions sur les médicaments et leurs effets",
    category: "pharmacologie",
    difficulty: "facile",
    free: true,
    questions: [
      {
        text: "Quel médicament est couramment utilisé comme anticoagulant?",
        options: ["Paracétamol", "Warfarine", "Ibuprofène", "Oméprazole"],
        correctAnswer: 1,
        explanation: "La warfarine est un anticoagulant couramment utilisé."
      }
    ]
  }
];

// Fonction pour insérer les quiz
async function seedQuizzes() {
  try {
    await Quiz.deleteMany({}); // Supprimer les quiz existants
    await Quiz.insertMany(sampleQuizzes);
    console.log('Sample quizzes added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
}

seedQuizzes();