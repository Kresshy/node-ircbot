/**
 * Created by Szabolcs on 2015.03.01..
 */

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
