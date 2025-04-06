var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
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

module.exports = router;
