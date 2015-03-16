/**
 * Created by Szabolcs on 2015.03.01..
 */

var express = require('express');
var Log = require('../../models/log');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    Log.find().limit(40).exec(function(err, logs) {

        var data = {
            _logs: logs
        };

        res.render('index', data);
    });
});

module.exports = router;
