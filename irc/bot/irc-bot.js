/**
 * Created by Szabolcs on 2015.02.27..
 */

var Client = require('./irc-client');
var Channel = require('./irc-channel');
var User = require('./irc-user');
var Log = require('../../models/log');
var EventEmitter = require('events').EventEmitter;

var Bot = (function IrcBot() {
    "use strict";

    var instance = null;

    function ClientClass(config) {

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
                var receivedCommand = message.match(/^@.*?[^\s]+/i);
                var command = null;

                if (receivedCommand) {

                    command = _commands[receivedCommand[0].trim()];

                    if (command !== undefined) {
                        command.handler()(from, to, message, _client);
                        logMessage = command.log();
                    } else {
                        console.log('undefined command');
                    }
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

            _client.on('pm', function(from, message) {
                console.log(from + ' => ' + message);
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
            command: function (command, pm) {

                _commands[command.name()] = command;
            },
            getCommands: function() {
                return _commands;
            },
            channel: function(channel) {

                return _channels[channel];
            }
        };
    }

    return {
        getInstance: function(config) {

            if (!instance) {
                if (arguments.length !== 0) {
                    instance = new ClientClass(config);
                } else {
                    console.error('you cannot create an ircbot without configuration');
                    return;
                }
            }

            return instance;
        }
    }
})();

module.exports = Bot;