/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

var Command = require('../bot/irc-bot-command');
var Log = require('../../models/log');
var User = require('../../models/user');
var IrcBot = require('../bot/irc-bot');

var command = new Command();

command.name('@help');

command.log(false);

command.handler(function(from, to, message, client) {

    var ircbot = IrcBot.getInstance();
    var commands = ircbot.getCommands();

    var help = "\nIrcBot application help:\n\n\nCOMMANDS:\n\n";

    for(key in commands) {
        if (commands.hasOwnProperty(key))
            help += commands[key].help() + "\n";
    }

    client.say(from, help);
});

command.help('@help -- prints out this text as a private message');

module.exports = command;
