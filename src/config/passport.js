const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = mongoose.model('users');

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//Passport local signup authentication configuration
/*passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
},
function(req, email, password, done) {
    User.findOne({ email: email })
        .then( (err, user) => {
            if (err) { 
                return done(err); 
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect username or password' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect username or password' });
            }
            return done(null, user);
        });
}
));*/

//Passport local login authentication configuration
passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username or password' });
                }
                user.validPassword(password)
                    .then(auth => {
                        if (!auth) {
                            return done(null, false, { message: 'Incorrect username or password' });
                        }
                        else {
                            return done(null, user);
                        }
                    })
                    .catch(err => {
                        console.error('Password Validation Error: ' + err);
                        return done(null, false, { message: 'Validation Error' });
                    });
            })
            .catch(err => {
                console.error('Passport user lookup error: ' + err);
                return done(null, false, { message: 'User database error' });
            });
    }
));

// Middleware to make sure a user is logged in
const checkAuth = function(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        return next();
    }

    // if they aren't redirect them to the login page
    req.flash('error', 'Please log in to continue');
    res.redirect('/login');
}

module.exports = {
    checkAuth
}