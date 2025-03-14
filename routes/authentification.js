const express = require('express');
const router = express.Router();

// Fonctions
const bcrypt = require('bcrypt');
const handleSession = require('../config/handleSession'); // Remplacez requireNoSession par handleSession
const mysqlConnect = require('../config/database');

// Pages des formulaires
router.get(
    '/signup',
    (req, res, next) => {
        handleSession(req, res, next, {
            requireNoSession: true, // Vérifie que l'utilisateur n'a pas de session
            redirectSession: '/profil', // Redirige vers le profil si une session existe
        });
    },
    (req, res) => {
        res.render('signup', { msg: req.query.msg }); // Affiche la page d'inscription
    },
);

router.get(
    '/signin',
    (req, res, next) => {
        handleSession(req, res, next, {
            requireNoSession: true, // Vérifie que l'utilisateur n'a pas de session
            redirectSession: '/profil', // Redirige vers le profil si une session existe
        });
    },
    (req, res) => {
        res.render('signin', { msg: req.query.msg }); // Affiche la page de connexion
    },
);

// Traitement de la connexion
router.post('/signinProcess', async (req, res) => {
    const { email, mdp } = req.body; // Récupération des données du formulaire
    await new Promise((resolve, reject) => {
        // Promesse pour la requête SQL
        mysqlConnect.query('SELECT * FROM users WHERE email = ?', [email], function (err, rows) {
            if (err) {
                // Si erreur
                reject(err); // Rejet de la promesse
            } else {
                resolve(rows[0]); // Résolution de la promesse
            }
        });
    })
        .then(async (row) => {
            // Si la promesse est résolue
            if (row && (await bcrypt.compare(mdp, row.mdp))) {
                // Si le mot de passe est correct
                // Stocker les informations de l'utilisateur dans la session et les cookies
                req.session.user = {
                    idUser: row.idUser,
                    email: email,
                    username: row.username
                };
                // Cookies pour la session (30 jours)
                res.cookie('idUser', row.idUser, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.cookie('email', email, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.cookie('username', row.username, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.redirect('/profil'); // Redirection vers la page de profil
            } else {
                res.redirect('/signin?msg=mdporemailincorrect'); // Redirection vers la page de connexion avec un message d'erreur
            }
        })
        .catch((err) => {
            // Gérer l'erreur
            console.error(err);
            res.redirect('/signin?msg=erreur'); // Redirection vers la page de connexion avec un message d'erreur
        });
});

// Traitement de l'inscription
router.post('/signupProcess', async (req, res) => {
    const { email, username, mdp, confirm_mdp } = req.body; // Récupération des données du formulaire
    if (mdp !== confirm_mdp) {
        // Si les mots de passe ne correspondent pas
        res.redirect('/signup?msg=mdpnotsame'); // Redirection vers la page d'inscription avec un message d'erreur
        return;
    }
    const hashedPassword = bcrypt.hashSync(mdp, 10); // Hachage du mot de passe
    let id_user; // Variable pour stocker l'id de l'utilisateur (depuis la db)
    await new Promise((resolve, reject) => {
        // Promesse pour la requête SQL
        mysqlConnect.query('INSERT INTO users(email, username, mdp) VALUES(?, ?, ?)', [email, username, hashedPassword], function (err, rows) {
            // Requête SQL
            if (err) {
                // Si erreur
                reject(err); // Rejet de la promesse
            } else {
                // Si pas d'erreur
                id_user = rows.insertId; // Récupération de l'id de l'utilisateur (dernier inséré)
                resolve(rows); // Résolution de la promesse
            }
        });
    });

    // Stocker les informations de l'utilisateur dans la session et les cookies
    req.session.user = {
        idUser: id_user,
        email: email,
        username: username
    };

    // Cookies pour la session (30 jours)
    res.cookie('idUser', id_user, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    });
    res.cookie('email', email, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    });
    res.cookie('username', username, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    });

    res.redirect('/profil'); // Redirection vers la page de profil
});

// Déconnexion
router.get('/signout', (req, res) => {
    // Détruire la session
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }

        // Supprimer les cookies
        res.clearCookie('idUser');
        res.clearCookie('email');
        res.clearCookie('username');

        // Rediriger vers la page de connexion
        res.redirect('/signin');
    });
});

module.exports = router;
