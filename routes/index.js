var express = require('express');
const db = require('../config/database');
var router = express.Router();

/**
 * Dans ce fichier, nous avons défini les différentes routes de notre site
 */

router.get('/', function (req, res, next) {
    if (!req.session.user) {
        res.render('index');
    } else {
        res.redirect('/accueil');
    }
});

router.get('/about', function (req, res, next) {
    res.render('about');
});

router.get('/profil', function (req, res, next) {
    if (req.session.user) {
        res.render('profil', { user: req.session.user });
    } else {
        res.redirect('/signin');
    }
});

router.get('/accueil', function (req, res, next) {
    if (req.session.user) {
        res.render('accueil', { user: req.session.user });
    } else {
        res.redirect('/signin');
    }
});

router.get('/memory', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/signin');
    } else {
        res.render('memory', { user: req.session.user });
    }
});

router.get('/add-score', function (req, res, next) {
    const { score, idJeu } = req.query;

    // on vérifie que le score et le jeu sont fournis
    if (!score || !idJeu) {
        return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }

    // on ajoute le score à la base de données
    const username = req.session.user.username;
    db.run('INSERT INTO scores (username, score, idJeu) VALUES (?, ?, ?)', [username, score, idJeu], (err) => {
        if (err) {
            console.error("Erreur lors de l'insertion du score :", err);
            return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
        }

        // on envoie la réponse de la requête
        res.json({ success: true, message: 'Score ajouté avec succès' });
    });
});

module.exports = router;
