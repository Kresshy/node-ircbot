var mongoose = require('mongoose');
var config = require('./config');
var IrcApp = require('./irc/ircapp');
var WebApp = require('./web/webapp');
var Log = require('./models/log');
var User = require('./models/user');

(function() {
    "use strict";

    var db = mongoose.connection;
    var webapp = new WebApp(config.webapp);
    var ircapp = new IrcApp(config.ircbot);

    var _failedDbConnection = false;

    var connect = function () {
        if (_failedDbConnection)
            return;

        console.log('Connecting to MongoDB');
        var options = { server: { socketOptions: { keepAlive: 1 } } };
        mongoose.connect(config.database.db, options);
    };

    connect();

    /* mongodb event handlers */
    mongoose.connection.on('error', function(err){
        _failedDbConnection = true;
        console.error(err);
    });

    mongoose.connection.on('disconnected', function() {
        connect();
    });

    mongoose.connection.once('open', function() {
        console.log('Mongo working!');
    });


    ircapp.on('connect', function (message) {
        console.log('Connected to IRC server');
    });

    ircapp.on('error', function(message) {
        console.error('ircbot error');
    });

    ircapp.connect();

    webapp.on('start', function(message) {
        console.log(message);
    });

    webapp.on('error', function(error) {
        console.log(error);
    });

    webapp.listen();
})();
