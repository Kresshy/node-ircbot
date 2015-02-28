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
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request = require('request');

/* import the configuration */
var config = require('./config');

var port = process.env.PORT || config.port || 8080;

/* import the routes handlers */
var index = require('./routes/index');
var users = require('./routes/users');
var books = require('./routes/books');
var search = require('./routes/search');
var lends = require('./routes/lends');

/* import the required mongodb models */
var User = require('./models/user');

/* initialize passport to use OAuth2 strategy */
passport.use(new OAuth2Strategy({
        authorizationURL: 'https://auth.sch.bme.hu/site/login',
        tokenURL: 'https://auth.sch.bme.hu/oauth2/token',
        clientID: '11302795928792584158',
        clientSecret: 'modXHTs7vs7uJl9XcJ8KcYJ0RaAeV618jTVqnEmZwjJ7KHUnRRytq8t9XtctpSqOmC6QGip3HzzS7J7O',
        callbackURL: "http://127.0.0.1:4567/auth"
    },
    function(accessToken, refreshToken, profile, done) {

        // getting the profile data isn't the part of the OAuth
        // standard so we must do this here by this request
        // because it is custom for every strategy
        request.get(
            'https://auth.sch.bme.hu/api/profile?access_token=' + accessToken,
            function(error, response, body) {
                if (error)
                    console.error(error.message);

                // the response body contains the profile data
                var res = JSON.parse(body);
                console.log(res);

                var loginUser = new User({
                    internal_id: res.internal_id,
                    name: res.displayName,
                    email: res.mail,
                    sn: res.sn,
                    given_name: res.givenName,
                    room_number: res.roomNumber,
                    basic: res.basic,
                });

                // first we look up the user in our database
                User.findOne({internal_id: loginUser.internal_id}, function(err, user) {
                    if (err) {
                        return console.error('Error: ', err);
                    }

                    // if the user not found then we insert into the db else resolve the function
                    if (!user) {
                        loginUser.save( function(err, savedUser) {
                            if (err) {
                                return console.error('Error: ', err);
                            }

                            done(err, savedUser);
                        });

                    } else {
                        done(err, user);
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

app.use('/profile', authenticated, users.profile);
app.use('/user', users.id);

app.use('/lend/new', authenticated, lends.newLend);
app.use('/lend/show', lends.id);
app.use('/lend/list', lends.list);
app.use('/lend/user', lends.user);

app.use('/book/new', authenticated, books.newBook);
app.use('/book/show', books.id);
app.use('/book/list', books.list);

app.use('/search', search);

/* login and redirect callback for OAuth2 strategy */
app.get('/login', passport.authenticate('oauth2', {
    scope: ['basic', 'displayName', 'sn', 'givenName', 'mail', 'linkedAccounts', 'roomNumber']
}));

app.get('/auth', passport.authenticate('oauth2', {
    failureRedirect: '/auth/fail',
    successRedirect: '/'
}));

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