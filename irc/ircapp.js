/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

var IrcBot = require('./bot/irc-bot');
var Log = require('../models/log');
var User = require('../models/user');

var off = require('./commands/off-command');
var here = require('./commands/here-command');
var history = require('./commands/history-command');
var reminder = require('./commands/reminder-command');

function IrcApp(config) {

    var ircbot = IrcBot.getInstance(config);

    ircbot.command(off);
    ircbot.command(here);
    ircbot.command(history);
    ircbot.command(reminder);

    return {
        connect: function () {

            ircbot.connect();
        },
        on: function (event, cb) {

            ircbot.on(event, cb);
        }
    }
}

module.exports = IrcApp;
