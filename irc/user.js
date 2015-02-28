/**
 * Created by Szabolcs on 2015.02.27..
 */

function User(nick, opts) {
    var _nick;
    var _opts;

    if (!nick) {
        console.error('You must add a nick name for the user');
        return;
    }

    _nick = nick;
    _opts = opts || {};

    return {
        setNick: function(nick) {
            if (typeof nick !== "string") {
                console.error('nick must be a string');
                return;
            }

            _nick = nick;
        },
        getNick: function() {
            return _nick;
        },
        setOpts: function(opts) {
            _opts = opts;
        },
        getOpts: function() {
            return _opts;
        },
        setOptsProperty: function(property, value) {
            _opts[property] = value;
        },
        getOptsProperty: function(property) {
            return _opts[property];
        }
    }
}

module.exports = User;