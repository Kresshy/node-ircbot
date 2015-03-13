/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

var Command = require('../bot/irc-bot-command');
var Log = require('../../models/log');
var User = require('../../models/user');
var IrcBot = require('../bot/irc-bot');

var command = new Command();

command.name('!here');

command.log(true);

command.handler(function(from, to, message, client) {

    var ircbot = IrcBot.getInstance();

    var users = ircbot.channel(to).getUsers();
    var notify = [];

    users.forEach(function (value) {

        if (value.getNick() !== from && value.getNick() !== client.getName()) {
            notify.push(value.getNick());
        }
    });

    if (notify.length > 0) {
        client.say(to, notify.join(' '));
    } else {
        client.say(to, 'The room is empty, there isn\'t anyone to notify...');
    }
});

command.help('!here -- mentioning all the users in the room');

module.exports = command;
