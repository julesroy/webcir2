const sqlite3 = require('sqlite3');
const path = require('path');

// Crée une instance de la base de données SQLite
const db = new sqlite3.Database(path.join(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données SQLite:', err);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
    }
});

module.exports = db;