var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.user) {
        res.render('index');
    } else {
        res.redirect('/profil');
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

router.get('/card-game', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/signin');
    } else {
        res.render('cardGame', { user: req.session.user });
    }
});

module.exports = router;
