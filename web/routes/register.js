/**
 * Created by Szabolcs_Varadi on 2015.04.27..
 */
/**
 * Created by Szabolcs on 2015.03.01..
 */

var express = require('express');
var async = require('async');
var UserModel = require('../../models/user');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('register');
});

router.post('/', function(req, res) {
    console.log(req.body);

    var user = new UserModel({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        ircNick: req.body.ircNick
    });

    user.save(function(err, user) {
        if (err) {
            console.error('Error when saving user: ' + err);
            return;
        }

        console.log(user);
        res.redirect('/login');
    })
});

module.exports = router;
