/**
 * Created by 최예찬 on 2016-08-20.
 */
/**
 * Created by qkswk on 2016-02-04.
 */

var crypto = require('crypto');
var mongo = require('../mongo');

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;


var objects = null;

exports.init = function (app) {

    if(!objects) {

        exports.serializeUserFunc = function (user, done) {
            done(null, user._id);
        };

        exports.deserializeUserFunc = function (id, done) {
            mongo.User.findOne({_id: id}).exec().then(function (user) {
                done(null, user);
            }, function (err) {
                done(err, false);
            });
        };

        passport.serializeUser(exports.serializeUserFunc);
        passport.deserializeUser(exports.deserializeUserFunc);

        passport.use(new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, email, password, done) {
                mongo.User.login(email, password)
                    .then(function (user) {
                        done(null, user);
                    }, function (err) {
                        if (err.isClient) done(null, false, {message: err.message});
                        else done(err, false);
                    });
            }
        ));

        objects = {
            initialize: passport.initialize(),
            session: passport.session()
        };
    }

    app.use(objects.initialize);
    app.use(objects.session);

};

