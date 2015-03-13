/**
 * Created by Szabolcs_Varadi on 2015.03.12..
 */

function Command() {
    "use strict";

    var _name,
        _log,
        _handler,
        _help;

    function isValidName(name) {
        return !!name.match(/^!.*?[^\s]+/i);
    }

    return {
        on: function(name, log, handler) {

            if (!isValidName(name)) {
                console.error('bad command name format, should be: @commad');
                return;
            }

            _name = name;

            if ('boolean' !== typeof log) {
                console.error('bad log type, should be: true / false');
                return;
            }

            _log = log;

            if ('function' !== typeof handler) {
                console.error('handler must be a function: function(from, to, message, client)');
                return;
            }

            _handler = handler;
        },
        name: function(name) {

            if (arguments.length === 0)
                return _name;

            if (!isValidName(name)) {
                console.error('bad command name format, should be: @command');
                return;
            }

            _name = name;
        },
        log: function(log) {

            if (arguments.length === 0)
                return _log;

            if ('boolean' !== typeof log) {
                console.error('bad log type, should be: true / false');
                return;
            }

            _log = log;
        },
        handler: function(handler) {

            if (arguments.length === 0)
                return _handler;

            if ('function' !== typeof handler) {
                console.error('handler must be a function: function(from, to, message, client)');
                return;
            }

            _handler = handler;
        },
        help: function(help) {

            if (arguments.length === 0)
                return _help;

            if ('string' !== typeof help) {
                console.error('help must be a string!');
                return;
            }

            _help = help;
        }
    };
}

module.exports = Command;
