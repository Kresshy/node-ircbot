/**
 * Created by Szabolcs on 2015.03.01..
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

module.exports = router;
