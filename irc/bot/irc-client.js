/**
 * Created by Szabolcs on 2015.02.27..
 */
var irc = require('irc');

var Client = (function() {
    "use strict";

    var instance = null;

    function ClientClass() {
        var _client,
            _server,
            _name,
            _channels;

        return {
            setServer: function(serverUrl) {

                if (typeof serverUrl !== "string") {
                    console.error('The url must be a string');
                    return;
                }

                _server = serverUrl;
            },
            getServer: function() {
                return _server;
            },
            setName: function(botName) {

                if (typeof botName !== "string") {
                    console.error('The botName must be a string');
                    return;
                }

                _name = botName;
            },
            getName: function() {
                return _name;
            },
            setChannels: function(channels) {

                if (!(channels instanceof Array)) {
                    console.error('You must specify the channels as Array [\'##awesome-room\']');
                    return;
                }

                _channels = channels;
            },
            getChannels: function() {
                return _channels;
            },
            connect: function() {

                if(!_server) {
                    console.error('You must set the server url');
                    return;
                }

                if(!_name) {
                    console.error('You must set the name of the bot');
                    return;
                }

                if(!_channels) {
                    console.error('You must set the channels to connect');
                    return;
                }

                _client = new irc.Client(_server, _name, {channels: _channels});
            },
            on: function(event, cb) {
                _client.addListener(event, cb);
            },
            say: function(dest, msg) {
                _client.say(dest, msg);
            }
        };
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = new ClientClass();
            }

            return instance;
        }
    };
})();

module.exports = Client;