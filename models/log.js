/**
 * Created by Szabolcs on 2015.02.27..
 */

var mongoose = require('mongoose');

var logSchema = mongoose.Schema({
    nick: String,
    message: String,
    channel: String,
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Log', logSchema);
