var express = require('express');
const db = require('../config/database');
var router = express.Router();

/**
 * Dans ce fichier, nous avons défini les différentes routes de notre site
 */

router.get('/', function (req, res) {
    if (!req.session.user) {
        res.render('index');
    } else {
        res.redirect('/accueil');
    }
});

router.get('/about', function (req, res) {
    res.render('about');
});

router.get('/profil', function (req, res) {
    if (req.session.user) {
        res.render('profil', { user: req.session.user });
    } else {
        res.redirect('/signin');
    }
});

router.get('/accueil', function (req, res) {
    if (req.session.user) {
        res.render('accueil', { user: req.session.user });
    } else {
        res.redirect('/signin');
    }
});

router.get('/scores', function (req, res) {
    if (req.session.user) {
        // on récupère les 5 meilleurs scores de chaque jeu
        const sql = `
            WITH ranked_scores AS (
                SELECT 
                    idJeu, 
                    username, 
                    score,
                    ROW_NUMBER() OVER (PARTITION BY idJeu ORDER BY score DESC) as rank
                FROM scores
            )
            SELECT idJeu, username, score
            FROM ranked_scores
            WHERE rank <= 5
            ORDER BY idJeu, rank;
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Erreur lors de la récupération des scores:", err);
                return res.redirect('/accueil?msg=erreurbdd');
            }

            // on regroupe les scores par jeu
            const scoresParJeu = {
                jeu1: rows.filter(row => row.idJeu === 1),
                jeu2: rows.filter(row => row.idJeu === 2),
                jeu3: rows.filter(row => row.idJeu === 3)
            };

            res.render('scores', { 
                user: req.session.user,
                scores: scoresParJeu
            });
        });
    } else {
        res.redirect('/signin');
    }
});

/**
 * Routes en rapport avec les jeux
 */

router.get('/memory', function (req, res) {
    if (!req.session.user) {
        res.redirect('/signin');
    } else {
        res.render('memory', { user: req.session.user });
    }
});

router.get('/add-score', function (req, res) {
    const { score, idJeu } = req.query;

    // on vérifie que le score et le jeu sont fournis
    if (!score || !idJeu) {
        return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }

    // on ajoute le score à la base de données
    const username = req.session.user.username;
    const idUtilisateur = req.session.user.idUtilisateur;
    db.run('INSERT INTO scores (username, score, idJeu, idUtilisateur) VALUES (?, ?, ?, ?)', [username, score, idJeu, idUtilisateur], (err) => {
        if (err) {
            console.error("Erreur lors de l'insertion du score :", err);
            return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
        }

        // on envoie la réponse de la requête
        res.json({ success: true, message: 'Score ajouté avec succès' });
    });
});

module.exports = router;
