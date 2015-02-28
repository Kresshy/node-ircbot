var mongoose = require('mongoose');
var config = require('./config');
var IrcBot = require('./irc/ircbot');

var db = mongoose.connection;
var ircbot = new IrcBot();

var connect = function () {
    console.log('Connecting to MongoDB');
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.db, options);
};

connect();

/* mongodb event handlers */
mongoose.connection.on('error', console.log);

mongoose.connection.on('disconnected', connect);

mongoose.connection.once('open', function() {
    console.log('Mongo working!');
});


ircbot.on('connect', function (message) {
    console.log('Connected to IRC server');
});

ircbot.on('error', function(message) {
    console.error('ircbot error');
});

ircbot.initializeWithConfig(config);
ircbot.connect();



