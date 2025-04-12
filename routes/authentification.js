const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');

/**
 * Dans ce fichier, nous avons défini les différentes routes/fonctions en rapport avec l'authentification de l'utilisateur sur notre site
 */

// règles pour les cookies
const cookieOptions = {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours de validité
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
};

function majSessionCookies(req, res, email, username) {
    // on met à jour la session utilisateur
    req.session.user.email = email;
    req.session.user.username = username;

    // on met à jour les cookies
    res.cookie('email', email, cookieOptions);
    res.cookie('username', username, cookieOptions);
}

// fonction pour créer la session et les cookies
function creerSessionCookies(req, res, user) {
    // on crée la session utilisateur
    req.session.user = {
        idUtilisateur: user.idUtilisateur,
        email: user.email,
        username: user.username,
    };

    // on crée les cookies
    res.cookie('idUtilisateur', user.idUtilisateur, cookieOptions);
    res.cookie('email', user.email, cookieOptions);
    res.cookie('username', user.username, cookieOptions);
}

// partie inscription
router.get('/signup', (req, res, next) => {
    if (req.session.user) {
        res.redirect('/accueil');
    } else {
        res.render('inscription', { msg: req.query.msg });
    }
});

router.post('/signupProcess', (req, res) => {
    const { email, username, mdp } = req.body;

    // on vérifie que tous les champs sont remplis
    if (!email || !username || !mdp) {
        return res.redirect('/signup?msg=champsmanquants');
    }

    // on vérifie si l'email existe déjà dans la base de données
    db.get('SELECT idUtilisateur FROM utilisateurs WHERE email = ?', [email], (err, utilisateurExistant) => {
        if (err) {
            console.error("Erreur lors de la vérification de l'email:", err);
            return res.redirect('/signup?msg=erreurbdd');
        }

        // si l'email existe déjà, on redirige vers la page d'inscription avec un message d'erreur
        if (utilisateurExistant) {
            return res.redirect('/signup?msg=emailexistant');
        }

        // on hash le mot de passe
        bcrypt.hash(mdp, 10, (err, mdpHash) => {
            if (err) {
                console.error('Erreur lors du hachage du mot de passe:', err);
                return res.redirect('/signup?msg=erreurbdd');
            }

            // on ajoute l'utilisateur dans la base de données
            db.run('INSERT INTO utilisateurs (email, username, mdp) VALUES (?, ?, ?)', [email, username, mdpHash], function (err) {
                if (err) {
                    console.error("Erreur lors de l'insertion de l'utilisateur:", err);
                    return res.redirect('/signup?msg=erreurbdd');
                }

                const newUser = {
                    idUtilisateur: this.lastID, // on utilise lastID pour récupérer le dernier ID inséré dans la base de données (permet de régler l'id de l'utilisateur)
                    email,
                    username,
                };

                // on crée la session et les cookies
                creerSessionCookies(req, res, newUser);

                // on redirige vers la page d'accueil
                res.redirect('/accueil');
            });
        });
    });
});

// partie connexion
router.get('/signin', (req, res) => {
    if (req.session.user) {
        res.redirect('/accueil');
    } else {
        res.render('connexion', { msg: req.query.msg });
    }
});

router.post('/signinProcess', (req, res) => {
    const { email, mdp } = req.body;

    // on vérifie que tous les champs sont remplis
    if (!email || !mdp) {
        return res.redirect('/signin?msg=champsmanquants');
    }

    // on récupère les données de l'utilisateur dans la base de données
    db.get('SELECT * FROM utilisateurs WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error("Erreur lors de la connexion de l'utilisateur:", err);
            return res.redirect('/signin?msg=erreurbdd');
        }

        // on compare le mot de passe haché avec le mot de passe fourni
        if (user && bcrypt.compareSync(mdp, user.mdp)) {
            // on crée la session et les cookies
            creerSessionCookies(req, res, user);

            // on redirige vers la page d'accueil
            res.redirect('/accueil');
        } else {
            // si l'email ou le mot de passe est incorrect, on redirige vers la page de connexion avec un message d'erreur
            res.redirect('/signin?msg=mdporemailincorrect');
        }
    });
});

// modification du compte
router.post('/updateProcess', (req, res) => {
    var { email, username, activermdp, mdp } = req.body;

    // on regarde si l'option de modification du mot de passe est activée
    if (Array.isArray(activermdp)) {
        activermdp = activermdp.includes('true') ? 'true' : 'false';
    }
    const modifierMdp = activermdp === 'true';

    if (modifierMdp) {
        // on met à jour les données
        db.run('UPDATE utilisateurs SET email = ?, username = ?, mdp = ? WHERE idUtilisateur = ?', [email, username, bcrypt.hashSync(mdp, 10), req.session.user.idUtilisateur],
            (err) => {
                if (err) {
                    console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
                    return res.redirect('/profil?msg=erreurbdd');
                }

                // on met à jour la session et les cookies
                majSessionCookies(req, res, email, username);

                // on redirige vers la page d'accueil avec un message de succès
                res.redirect('/accueil?msg=modificationok');
            }
        );
    } else {
        // on met à jour les données (sans modifier le mot de passe)
        db.run('UPDATE utilisateurs SET email = ?, username = ? WHERE idUtilisateur = ?', [email, username, req.session.user.idUtilisateur],
            (err) => {
                if (err) {
                    console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
                    return res.redirect('/profil?msg=erreurbdd');
                }

                // on met à jour la session et les cookies
                majSessionCookies(req, res, email, username);

                // on redirige vers la page d'accueil avec un message de succès
                res.redirect('/accueil?msg=modificationok');
            }
        );
    }
});

// déconnexion du compte
router.get('/signout', (req, res) => {
    // on détruit la session
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }

        // on détruit les cookies
        res.clearCookie('idUtilisateur');
        res.clearCookie('email');
        res.clearCookie('username');

        // on redirige vers la page de connexion
        res.redirect('/signin');
    });
});

module.exports = router;
