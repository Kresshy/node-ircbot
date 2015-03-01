var mongoose = require('mongoose');
var config = require('./config');
var IrcBot = require('./irc/ircbot');
var WebApp = require('./web/webapp');

(function() {
    "use strict";

    var db = mongoose.connection;
    var ircbot = new IrcBot(config.ircbot);
    var webapp = new WebApp(config.webapp);

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


    ircbot.on('connect', function (message) {
        console.log('Connected to IRC server');
    });

    ircbot.on('error', function(message) {
        console.error('ircbot error');
    });

    ircbot.connect();

    webapp.on('start', function(message) {
        console.log(message);
    });

    webapp.on('error', function(error) {
        console.log(error);
    });

    webapp.listen();
})();
