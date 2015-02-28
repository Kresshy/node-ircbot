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

/* import the configuration */
var config = require('../config');

var port = process.env.PORT || config.port || 8080;

/* import the route handlers */
var index = require('./routes/index');

/* import the required mongodb models */
var User = require('../models/user');

/* initialize passport to use OAuth2 strategy */
passport.use(new LocalStrategy(
    function(email, password, done) {
        User.findOne({ email: email }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }

            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        });
    }
));

/* serialize and deserialize user from db to requests usage:
 *
 * use the req.user object in every route handler to access
 * logged in user data.
 */
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        console.log('deserialize user');
        done(err, user);
    });
});

passport.serializeUser(function(user, done) {
    console.log('serialize user');
    done(null, user.id);
});

/* helper middleware for checking the user authenticated before
 */

function authenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else
        res.send('Authentication required');
}

/* connect to mongodb */
var connect = function () {
    console.log('Connecting to MongoDB');
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.db, options);
};

connect();

/* mongodb event handlers */
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);
mongoose.connection.once('open', function() {
    console.log('Mongo working!');
});

/* initialize express application middlewares */
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: config.secret}));
app.use(passport.initialize());
app.use(passport.session());

/* routes and handlers */
app.use('/', index);

app.get('/login', function(req, res, next) {
    "use strict";

});

/* login and redirect callback for OAuth2 strategy */
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true }
    )
);

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/* application listen on configured port */
app.listen(port, '0.0.0.0', function() {
    console.log('Application listen\'s on port: ' + port);
});