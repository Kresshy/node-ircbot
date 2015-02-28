var mongoose = require('mongoose');
var config = require('./config');
var ircbot = require('./irc/ircbot');

var db = mongoose.connection;

db.on('error', function() {
    console.error('connection error:')
});
db.once('open', function () {
    console.log('Connected to MongoDB');
});

mongoose.connect('mongodb://localhost/ircbot');

ircbot.on('connect', function (message) {
    console.log('Connected to IRC server');
});
ircbot.on('error', function(message) {
    console.error('ircbot error');
});

ircbot.initializeWithConfig(config);
ircbot.connect();
