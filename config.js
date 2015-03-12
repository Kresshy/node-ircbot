/**
 * Created by Szabolcs on 2015.02.27..
 */

module.exports = {
    database: {
        db: 'mongodb://localhost/ircbot'
    },
    ircbot: {
        channels: ["##kir-dev-test"],
        server: "irc.freenode.net",
        botName: "Jezz"
    },
    webapp: {
        port: 9000,
        secret: 'SUPERsekret'
    }
};