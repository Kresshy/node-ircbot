/**
 * Created by Szabolcs on 2015.03.01..
 */

var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('login');
});

/* login and redirect callback for local strategy */
router.post('/',
    passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        }
    )
);

module.exports = router;