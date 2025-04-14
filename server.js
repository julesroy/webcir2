const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware pour servir les fichiers statiques (assets, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// Route par défaut pour servir ton index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur Express en écoute sur http://localhost:${port}`);
});
