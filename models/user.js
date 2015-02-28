/**
 * Created by Szabolcs on 2015.02.28..
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {type: String, required: '{PATH} is required!'},
    email: {type: String, required: '{PATH} is required!'},
    password: {type: String, required: '{PATH} is required!'}
});

module.exports = mongoose.model('User', userSchema);