/**
 * Created by Szabolcs on 2015.03.01..
 */

var express = require('express');
var async = require('async');
var LogModel = require('../../models/log');
var ChannelModel = require('../../models/channel');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {

    var data = {};

    function logQuery(cb) {
        LogModel.find().limit(40).exec(function (err, logs) {

            if (err) {
                cb(err, null);
            }

            cb(null, logs);
        });
    }

    function channelQuery(cb) {
        ChannelModel.find().exec(function(err, channels) {

            if(err) {
                cb(err, null);
            }

            cb(null, channels);
        });
    }

    async.parallel([
        logQuery,
        channelQuery
    ], complete);

    function complete(err, results) {

        if(err) {
            next(err);
        }

        data._logs = results[0];
        data._channels = results[1];

        res.render('index', data);
    }
});

module.exports = router;
