// routes/test.js
const express = require('express');
const router = express.Router();

router.get('/env', (req, res) => {
  // Ne renvoyez pas les valeurs réelles en production!
  if (process.env.NODE_ENV === 'production') {
    return res.json({
      message: 'Configuration chargée',
      paydunya_mode: process.env.PAYDUNYA_MODE,
      node_env: process.env.NODE_ENV
    });
  }
  
  res.json({
    paydunya_master_key: process.env.PAYDUNYA_MASTER_KEY ? 'Configurée' : 'Manquante',
    paydunya_private_key: process.env.PAYDUNYA_PRIVATE_KEY ? 'Configurée' : 'Manquante',
    paydunya_public_key: process.env.PAYDUNYA_PUBLIC_KEY ? 'Configurée' : 'Manquante',
    paydunya_token: process.env.PAYDUNYA_TOKEN ? 'Configurée' : 'Manquante',
    paydunya_mode: process.env.PAYDUNYA_MODE,
    frontend_url: process.env.FRONTEND_URL,
    backend_url: process.env.BACKEND_URL,
    node_env: process.env.NODE_ENV
  });
});

module.exports = router;