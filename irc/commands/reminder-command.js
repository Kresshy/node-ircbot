/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

var Command = require('../bot/irc-bot-command');

var command = new Command();

command.name('!reminder');

command.log(true);

command.handler(function(from, to, message, client) {

    client.say(to, 'This command is not yet implemented');
});

command.help('!reminder -- set a reminder for a user when he comes online');

module.exports = command;
