/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

var Command = require('../bot/irc-bot-command');
var Log = require('../../models/log');
var User = require('../../models/user');
var IrcBot = require('../bot/irc-bot');

var command = new Command();

command.name('!history');

command.log(true);

command.handler(function(from, to, message, client) {

    Log.find().sort({date: -1}).limit(10).exec(function (err, logs) {
        logs.forEach(function (log) {
            client.say(from, log.nick + ' - ' + log.channel + ' - ' + log.date + ' || ' + log.message);
        });
    });
});

command.help('!history -- sends the last log items of the room for the user as a private message');

module.exports = command;
