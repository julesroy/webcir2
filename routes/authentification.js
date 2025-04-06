const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const handleSession = require('../config/handleSession');
const db = require('../config/database'); // Assure-toi d'utiliser la bonne instance de db

// Fonction utilitaire pour créer la session et les cookies
function createSessionAndCookies(req, res, user) {
    req.session.user = {
        idUtilisateur: user.idUtilisateur,
        email: user.email,
        username: user.username,
    };

    const cookieOptions = {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
        httpOnly: true,
        secure: true, // uniquement en HTTPS
        sameSite: 'Strict', // protection contre CSRF
    };

    res.cookie('idUtilisateur', user.idUtilisateur, cookieOptions);
    res.cookie('email', user.email, cookieOptions);
    res.cookie('username', user.username, cookieOptions);
}

// Formulaires d'inscription et de connexion
router.get(
    '/signup',
    (req, res, next) => {
        handleSession(req, res, next, {
            requireNoSession: true,
            redirectSession: '/profil',
        });
    },
    (req, res) => {
        res.render('inscription', { msg: req.query.msg });
    },
);

router.get(
    '/signin',
    (req, res, next) => {
        handleSession(req, res, next, {
            requireNoSession: true,
            redirectSession: '/profil',
        });
    },
    (req, res) => {
        res.render('connexion', { msg: req.query.msg });
    },
);

// Traitement connexion
router.post('/signinProcess', (req, res) => {
    const { email, mdp } = req.body;

    if (!email || !mdp) {
        return res.redirect('/signin?msg=champsmanquants');
    }

    // Requête pour vérifier l'email dans la base de données
    db.get('SELECT * FROM utilisateurs WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error("Erreur lors de la connexion de l'utilisateur:", err);
            return res.redirect('/signin?msg=erreurbdd');
        }

        if (user && bcrypt.compareSync(mdp, user.mdp)) {
            // Comparaison du mot de passe
            createSessionAndCookies(req, res, user);
            res.redirect('/profil');
        } else {
            res.redirect('/signin?msg=mdporemailincorrect');
        }
    });
});

// Traitement inscription
router.post('/signupProcess', (req, res) => {
    const { email, username, mdp } = req.body;

    if (!email || !username || !mdp) {
        return res.redirect('/signup?msg=champsmanquants');
    }

    // Vérifier si l'email existe déjà dans la base de données
    db.get('SELECT idUtilisateur FROM utilisateurs WHERE email = ?', [email], (err, existingUser) => {
        if (err) {
            console.error("Erreur lors de la vérification de l'email:", err);
            return res.redirect('/signup?msg=erreurbdd');
        }

        if (existingUser) {
            return res.redirect('/signup?msg=emailexistant');
        }

        // Hacher le mot de passe et l'insérer dans la base de données
        bcrypt.hash(mdp, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Erreur lors du hachage du mot de passe:', err);
                return res.redirect('/signup?msg=erreurbdd');
            }

            // Insérer le nouvel utilisateur
            db.run('INSERT INTO utilisateurs (email, username, mdp) VALUES (?, ?, ?)', [email, username, hashedPassword], function (err) {
                if (err) {
                    console.error("Erreur lors de l'insertion de l'utilisateur:", err);
                    return res.redirect('/signup?msg=erreurbdd');
                }

                const newUser = {
                    idUtilisateur: this.lastID, // Utilisation de lastID pour récupérer l'ID inséré
                    email,
                    username,
                };

                createSessionAndCookies(req, res, newUser);
                res.redirect('/profil');
            });
        });
    });
});

// Déconnexion
router.get('/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }

        res.clearCookie('idUtilisateur');
        res.clearCookie('email');
        res.clearCookie('username');

        res.redirect('/signin');
    });
});

module.exports = router;
