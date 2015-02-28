/**
 * Created by Szabolcs on 2015.02.27..
 */

var Bot = require('./bot');
var Channel = require('./channel');
var User = require('./user');
var Log = require('../models/log');
var EventEmitter = require('events').EventEmitter;

var _bot = Bot.getInstance();
var _channels = {};
var _eventEmitter = new EventEmitter();


function initializeEventHandlers() {

    _bot.on('registered', function(message) {
        _eventEmitter.emit('connect', message);
    });

    _bot.on('join', function (channel, nick) {

        _channels[channel].addUser(new User(nick));
    });

    _bot.on('names', function (channel, nicks) {

        var users = [];


        for (var prop in nicks) {
            if (nicks.hasOwnProperty(prop)) {
                users.push(new User(prop, nicks[prop]));
            }
        }

        _channels[channel].setUsers(users);
    });

    _bot.on('message', function (from, to, message) {
        var logMessage = true;

        var command = message.match(/^@.*?[^\s]+/i);

        if (!command)
            command = ['message'];

        switch (command[0].trim()) {
            case '@off':
                logMessage = false;
                _bot.say(to, '@off -- Excluding previous message');

                break;

            case '@here':
                var users = _channels[to].getUsers();
                var notify = [];

                users.forEach(function (value, index) {
                    console.log(value);

                    if (value.getNick() !== from && value.getNick() !== _bot.getName()) {
                        notify.push(value.getNick());
                    }
                });

                if (notify.length > 0)
                    _bot.say(to, notify.join(' '));
                else
                    _bot.say(to, 'The room is empty, there aren\'t anyone to notify...');

                break;

            case '@history':
                Log.find().sort({date: -1}).limit(10).exec(function (err, logs) {
                    logs.forEach(function (log, index) {
                        _bot.say(from, log.nick + ' - ' + log.channel + ' - ' + log.date + ' || ' + log.message);
                    });
                });

                break;

            case '@reminder':
                _bot.say(to, 'Not yet implemented feature');

                break;

            case '@help':
                _bot.say(from, printHelp());

                break;
            case 'message':
                break;
            default:
                console.error('Unknown command' + command[0]);
                break;
        }

        if (!logMessage)
            return;

        var log = new Log({
            nick: from,
            message: message,
            channel: to
        });

        log.save(function (err, log) {
            if (err)
                console.error('Error when saving log: ' + err.message);
        });
    });

    _bot.on('quit', function (nick, reason, channels) {

        channels.forEach(function(value, index) {
            if (_channels.hasOwnProperty(value))
                _channels[value].removeUser(nick);
        });
    });

    _bot.on('error', function (message) {
        _eventEmitter.emit('error', message);
    });
}

function initializeChannels(channels) {
    channels.forEach(function (value, index) {
        _channels[value] = new Channel(value);
    });
}

function isCommand(message) {
    return new RegExp(/^@.*?[^\s]+/i).test(message);
}

function printHelp() {
    return "IrcBot Help:\n\n" +
        "\n" +
        "Commands:\n\n" +
        "	@help - prints this stuff\n" +
        "	@off - the message does not stored in the log\n" +
        "	@history - prints the last 10 messages\n" +
        "	@here - mentions everyone in the room\n" +
        "	@reminder - reminder for a user when joins to channel\n" +
        "\n"
}

module.exports = {
    initialize: function (url, name, channels) {

        _bot.setServer(url);
        _bot.setName(name);
        _bot.setChannels(channels);

        initializeChannels(channels);
    },
    initializeWithConfig: function(config) {

        _bot.setServer(config.server);
        _bot.setName(config.botName);
        _bot.setChannels(config.channels);

        initializeChannels(config.channels);
    },
    connect: function() {

        _bot.connect();
        initializeEventHandlers();
    },
    on: function(event, cb) {
        var _events = ['connect', 'error', 'quit'];

        if(_events.indexOf(event) === -1) {
            console.error('unsupported event');
            return;
        }

        _eventEmitter.on(event, cb);
    }
};