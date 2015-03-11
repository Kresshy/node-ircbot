/**
 * Created by Szabolcs on 2015.02.27..
 */

var Client = require('./client');
var Channel = require('./channel');
var User = require('./user');
var Log = require('../models/log');
var EventEmitter = require('events').EventEmitter;

function IrcBot(config) {
    "use strict";

    var _client = Client.getInstance();
    var _channels = {};
    var _eventEmitter = new EventEmitter();
    var _commands = {};

    _client.setServer(config.server);
    _client.setName(config.botName);
    _client.setChannels(config.channels);

    initializeChannels(config.channels);

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
                return;
            }

            if (_commands[command[0]] !== undefined) {
               logMessage = _commands[command[0]](from, to, message, _client);
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

    function isCommand(command) {
        return !command.match(/^@.*/i);
    }

    function printHelp() {

        var helpText = "IrcBot Help:\n\n" +
            "\n" +
            "Commands:\n\n";

        // TODO

        return helpText;
    }

    return {
        connect: function () {

            _client.connect();
            initializeEventHandlers();
        },
        on: function (event, cb) {

            var _events = ['connect', 'error', 'quit'];

            if(_events.indexOf(event) === -1) {
                console.error('unsupported event');
                return;
            }

            _eventEmitter.on(event, cb);
        },
        command: function (command, cb) {

            if (isCommand(command)) {
                console.error('bad command format: @example');
                return;
            }

            if (_commands[command] !== undefined) {
                console.error('command already defined');
                return;
            }

            _commands[command] = cb;
        },
        getChannelInfo: function(channel) {
            return _channels[channel];
        }
    };
}

module.exports = IrcBot;