// ✅ Quiz gratuit accessible à tous les utilisateurs connectés
router.get('/free', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ free: true }, 'title description duration category difficulty');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Quiz premium → seulement abonnés
router.get('/premium', authMiddleware, checkSubscription, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ free: false }, 'title description duration category difficulty');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
