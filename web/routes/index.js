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

    function logQuery(done) {
        LogModel.find().limit(40).exec(function (err, logs) {

            if (err) {
                done(err, null);
            }

            done(null, logs);
        });
    }

    function channelQuery(done) {
        ChannelModel.find().exec(function(err, channels) {

            if(err) {
                done(err, null);
            }

            done(null, channels);
        });
    }

    async.parallel([
        logQuery,
        channelQuery
    ], complete);

    function complete(err, results) {

        var data = {};

        if(err) {
            err.status = 500;
            next(err);
            return;
        }

        data._logs = results[0];
        data._channels = results[1];
        data.helpers = {
            _even: function(index) {
                if (index % 2 === 1)
                    return 'bg-alt';
                else
                    return 'bg-norm';
            }
        }

        res.render('index', data);
    }
});

module.exports = router;
