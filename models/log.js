/**
 * Created by Szabolcs on 2015.02.27..
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logSchema = new Schema({
    nick: String,
    message: String,
    channel: {type: Schema.Types.ObjectId, ref: 'Channel'},
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Log', logSchema);
