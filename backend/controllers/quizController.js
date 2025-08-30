const Quiz = require('../models/Quiz');
const Activity = require('../models/Activity');

// Créer un quiz
exports.createQuiz = async (req, res) => {
  try {
    const newQuiz = new Quiz(req.body);
    await newQuiz.save();
    
    // Enregistrer l'activité
    const activity = new Activity({
      userId: req.user._id,
      type: 'quiz_created',
      title: 'Quiz créé',
      description: `A créé un nouveau quiz: ${newQuiz.title}`,
      data: {
        quizId: newQuiz._id,
        title: newQuiz.title
      }
    });
    await activity.save();
    
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtenir un quiz par ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });
    
    // Enregistrer l'activité de consultation de quiz
    const activity = new Activity({
      userId: req.user._id,
      type: 'quiz_viewed',
      title: 'Quiz consulté',
      description: `A consulté le quiz: ${quiz.title}`,
      data: {
        quizId: quiz._id,
        title: quiz.title
      }
    });
    await activity.save();
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};