/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

var IrcBot = require('./bot/irc-bot');
var Log = require('../models/log');
var User = require('../models/user');

var offCommand = require('./commands/off-command');
var hereCommand = require('./commands/here-command');
var historyCommand = require('./commands/history-command');
var reminderCommand = require('./commands/reminder-command');
var helpCommand = require('./commands/help-command');

function IrcApp(config) {

    var ircbot = IrcBot.getInstance(config);

    ircbot.command(offCommand);
    ircbot.command(hereCommand);
    ircbot.command(historyCommand);
    ircbot.command(reminderCommand);
    ircbot.command(helpCommand);

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
