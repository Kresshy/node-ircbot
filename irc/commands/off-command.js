/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

var Command = require('../bot/irc-bot-command');

var command = new Command();

command.name('@off');

command.log(false);

command.handler(function(from, to, message, client) {

    client.say(to, '@off -- Excluding previous message from logs');
});

command.help('@off -- disable logging of the current message');

module.exports = command;

