/**
 * Created by Szabolcs on 2015.02.27..
 */

var Client = require('./client');
var Channel = require('./channel');
var User = require('./user');
var Log = require('../models/log');
var EventEmitter = require('events').EventEmitter;

function IrcBot() {
    "use strict";

    var _client = Client.getInstance();
    var _channels = {};
    var _eventEmitter = new EventEmitter();

    function initializeEventHandlers() {

        _client.on('registered', function (message) {
            _eventEmitter.emit('connect', message);
        });

        _client.on('join', function (channel, nick) {

            _channels[channel].addUser(new User(nick));
        });

        _client.on('names', function (channel, nicks) {

            var users = [];


            for (var prop in nicks) {
                if (nicks.hasOwnProperty(prop)) {
                    users.push(new User(prop, nicks[prop]));
                }
            }

            _channels[channel].setUsers(users);
        });

        _client.on('message', function (from, to, message) {
            var logMessage = true;

            var command = message.match(/^@.*?[^\s]+/i);

            if (!command) {
                command = ['message'];
            }

            switch (command[0].trim()) {
                case '@off':
                    logMessage = false;
                    _client.say(to, '@off -- Excluding previous message');

                    break;

                case '@here':
                    var users = _channels[to].getUsers();
                    var notify = [];

                    users.forEach(function (value) {

                        if (value.getNick() !== from && value.getNick() !== _client.getName()) {
                            notify.push(value.getNick());
                        }
                    });

                    if (notify.length > 0) {
                        _client.say(to, notify.join(' '));
                    } else {
                        _client.say(to, 'The room is empty, there aren\'t anyone to notify...');
                    }

                    break;

                case '@history':
                    Log.find().sort({date: -1}).limit(10).exec(function (err, logs) {
                        logs.forEach(function (log) {
                            _client.say(from, log.nick + ' - ' + log.channel + ' - ' + log.date + ' || ' + log.message);
                        });
                    });

                    break;

                case '@reminder':
                    _client.say(to, 'Not yet implemented feature');

                    break;

                case '@help':
                    _client.say(from, printHelp());

                    break;
                case 'message':
                    break;
                default:
                    console.error('Unknown command' + command[0]);
                    break;
            }

            if (!logMessage) {
                return;
            }

            var log = new Log({
                nick: from,
                message: message,
                channel: to
            });

            log.save(function (err, log) {
                if (err) {
                    console.error('Error when saving log: ' + err.message);
                }
            });
        });

        _client.on('quit', function (nick, reason, channels) {

            channels.forEach(function (value, index) {
                if (_channels.hasOwnProperty(value)) {
                    _channels[value].removeUser(nick);
                }
            });
        });

        _client.on('error', function (message) {
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
            "\n";
    }

    return {
        initialize: function (url, name, channels) {

            _client.setServer(url);
            _client.setName(name);
            _client.setChannels(channels);

            initializeChannels(channels);
        },
        initializeWithConfig: function(config) {

            _client.setServer(config.server);
            _client.setName(config.botName);
            _client.setChannels(config.channels);

            initializeChannels(config.channels);
        },
        connect: function() {

            _client.connect();
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
}

module.exports = IrcBot;