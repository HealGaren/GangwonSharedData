/**
 * Created by 최예찬 on 2016-08-20.
 */
/**
 * Created by qkswk on 2016-02-04.
 */

var crypto = require('crypto');
var mongo = require('../mongo');

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy;


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
                mongo.User.loginLocal(email, password)
                    .then(function (user) {
                        done(null, user);
                    }, function (err) {
                        if (err.isClient) done(null, false, {message: err.message});
                        else done(err, false);
                    });
            }
        ));

        passport.use(new FacebookStrategy({
                clientID: '1712738072330917',
                clientSecret: 'e7a58f520031e7f0f214f9ddd3099740',
                callbackURL: 'http://hy.applepi.kr/login/facebook/callback',
                profileFields: ['id', 'emails']
            },
            function (accessToken, refreshToken, profile, done) {
                mongo.User.loginFacebook(profile.id, profile.emails[0].value)
                    .then(function (user) {
                        done(null, user);
                    }, function (err) {
                        if (err.isClient) done(null, false, err.message);
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

