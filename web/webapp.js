/**
 * Created by Szabolcs on 2015.02.28..
 */

/* import the required dependencies */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var expressHbs = require('express-handlebars');

/* import the required mongodb models */
var User = require('../models/user');

/* import the route handlers */
var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var logs = require('./routes/logs');
var register = require('./routes/register');

function WebApp(config) {
    "use strict";

    var _config = config;
    var _port = process.env.PORT || config.port || 8080;
    var _eventEmitter = new EventEmitter();

    /* initialize passport to use local strategy */
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, done) {
            console.log('authenticate: ' + email);

            User.findOne({email: email}, function (err, user) {
                console.log(user);

                if (err) {
                    console.log('Authentication error: ' + err);
                    return done(err);
                }

                if (!user) {
                    return done(null, false, {message: 'Incorrect email.'});
                }

                user.comparePassword(password, function(err, match) {
                    if (err) {
                        return done(null, false, {message: err});
                    } else if (!match) {
                        return done(null, false, {message: 'Incorrect password.'});
                    } else {
                        return done(null, user);
                    }
                });
            });
        }
    ));

    /* serialize and deserialize user from db to requests usage:
     *
     * use the req.user object in every route handler to access
     * logged in user data.
     */
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            console.log('deserialize user');
            done(err, user);
        });
    });

    passport.serializeUser(function (user, done) {
        console.log('serialize user');
        done(null, user.id);
    });

    /* helper middleware for checking the user authenticated before
     */
    function authenticated(req, res, next) {
        if (req.isAuthenticated())
            return next();
        else
            res.render('login', {error: 'Authentication required'});
    }

    /* initialize express application middlewares */
    var app = express();

    /* initialize view template engine */
    app.engine('hbs', expressHbs({
        extname: 'hbs',
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/layouts/',
        partialsDir: __dirname + '/views/partials/'
    }));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));

    // uncomment after placing your favicon in /public
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(session({secret: config.secret}));
    app.use(passport.initialize());
    app.use(passport.session());

    /* routes and handlers */
    app.use('/login', login);
    app.use('/logout', logout);
    app.use('/register', register);
    app.use('/logs', logs);
    app.use('/', authenticated, index);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            _eventEmitter.emit('error', err);

            res.status(err.status || 500);
            res.render('error', {
                _message: err.message,
                _error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        _eventEmitter.emit('error', err);

        res.status(err.status || 500);
        res.render('error', {
            _message: err.message,
            _error: {}
        });
    });

    return {
        listen: function () {

            /* application listen on configured port */
            app.listen(_port, '0.0.0.0', function () {
                _eventEmitter.emit('start', 'Application listen\'s on port: ' + _port);
            });
        },
        on: function (event, cb) {
            var _events = ['start', 'error', 'quit'];

            if (_events.indexOf(event) === -1) {
                console.error('unsupported event');
                return;
            }

            _eventEmitter.on(event, cb);
        }
    };
}

module.exports = WebApp;