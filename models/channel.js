/**
 * Created by Szabolcs_Varadi on 2015.03.16..
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var channelSchema = new Schema({
    name: String
});

module.exports = mongoose.model('IrcChannel', channelSchema);
