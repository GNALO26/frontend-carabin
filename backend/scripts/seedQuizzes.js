const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
require('dotenv').config();

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Données des quiz avec les catégories valides
const sampleQuizzes = [
  {
    title: "Anatomie du cœur",
    description: "Testez vos connaissances sur l'anatomie cardiaque",
    category: "physiologie-renale", // Catégorie valide
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
    category: "tissu-epithelial", // Catégorie valide
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
  },
  {
    title: "Physiologie rénale",
    description: "Quiz sur les fonctions rénales",
    category: "physiologie-renale", // Catégorie valide
    difficulty: "difficile",
    free: false,
    questions: [
      {
        text: "Où se produit la majorité de la réabsorption de l'eau dans le néphron?",
        options: ["Glomérule", "Tubule contourné proximal", "Anse de Henle", "Tubule contourné distal"],
        correctAnswer: 2,
        explanation: "L'anse de Henle est responsable de la réabsorption de l'eau et des électrolytes."
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