var mongoose = require('mongoose');
var config = require('./config');
var IrcBot = require('./irc/ircbot');
var WebApp = require('./web/webapp');
var Log = require('./models/log');
var User = require('./models/user');

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

    ircbot.command('@off', function(from, to, message, client) {

        client.say(to, '@off -- Excluding previous message');
        return false;
    });

    ircbot.command('@here', function(from, to, message, client) {

        var users = ircbot.getChannelInfo(to).getUsers();
        var notify = [];

        users.forEach(function (value) {

            if (value.getNick() !== from && value.getNick() !== client.getName()) {
                notify.push(value.getNick());
            }
        });

        if (notify.length > 0) {
            client.say(to, notify.join(' '));
        } else {
            client.say(to, 'The room is empty, there aren\'t anyone to notify...');
        }

        return true;
    });

    ircbot.command('@history', function(from, to, message, client) {

        Log.find().sort({date: -1}).limit(10).exec(function (err, logs) {
            logs.forEach(function (log) {
                client.say(from, log.nick + ' - ' + log.channel + ' - ' + log.date + ' || ' + log.message);
            });
        });
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
