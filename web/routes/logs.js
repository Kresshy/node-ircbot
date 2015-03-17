/**
 * Created by Szabolcs on 2015.03.01..
 */

var express = require('express');
var async = require('async');
var LogModel = require('../../models/log');
var ChannelModel = require('../../models/channel');
var router = express.Router();

/* GET home page. */
router.get('/list/:num/:count', function(req, res, next) {
    var _num = req.params.num;
    var _count = req.params.count;

    var _start = _num - _count;

    if (_start < 0)
        _start = 0;

    var response = {};

    function countLogQuery(done) {
        LogModel.count({}).exec(function(err, count) {
            if(err) {
                done(err, null);
                return;
            }

            done(null, count);
        });
    }

    function logQuery(done) {
        LogModel.find().skip(_start).limit(_num).exec(function(err, logs) {

            if (err) {
                done(err, null);
                return;
            }

            done(null, logs);
        });
    }

    async.parallel([
        countLogQuery,
        logQuery
    ], complete);

    function complete(err, results) {
        if (err) {
            err.status = 500;
            next(err);
            return;
        }

        response.count = results[0];
        response.logs = results[1];

        res.send(response);
    }
});

module.exports = router;
