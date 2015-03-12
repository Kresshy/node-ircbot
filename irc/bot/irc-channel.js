/**
 * Created by Szabolcs on 2015.02.27..
 */
function Channel(name, users) {
    "use strict";

    var _name;
    var _users;

    if (typeof name !== "string") {
        console.error('You must add a name for the channel');
        return;
    }

    if (!(users instanceof Array)) {
        console.error('Missing users (optional) @ channel: ' + name + ' initialization');
    }

    _name = name;
    _users = users || [];

    return {
        setName: function(name) {
            if (typeof name !== "string") {
                console.error('Name must be a string');
                return;
            }

            _name = name;
        },
        getName: function() {
            return _name;
        },
        setUsers: function(users) {
            if (!(users instanceof Array)) {
                console.error('Users must be an Array');
                return;
            }

            _users = users;
        },
        getUsers: function() {
            return _users;
        },
        addUser: function(user) {
            _users.push(user);
        },
        removeUser: function(nick) {
            for (var i = 0; i < _users.length; i++) {
                if (_users[i].getNick() === nick) {
                    _users.splice(i, 1);
                    break;
                }
            }
        }
    };
}

module.exports = Channel;
