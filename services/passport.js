// Import modules
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/user-model');

// Serialize and deserialize user information to support sessions
passport.serializeUser(function(user, done) {
    done(null, user.id)
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Passport for Google OAuth2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_BASE_URL} + /auth/google/callback`,
    proxy: true
},
async function(accessToken, refreshToken, profile, done) {
    try{
        // Check if the User already exists
        const existingUser = await User.findOne({ profileId: profile.id });
        // If they do, attempt to redirect them to the dashboard immediately
        if (existingUser) {
            done(null, existingUser);
        } else {
            // If not, create a new User and add it to the profile database before attempting to redirect the user
            const newUser = new User({
                profileId: profile.id,
                cloudProvider: profile.provider,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                threshold: 0.8
            });
            const savedUser = await newUser.save();
            console.log(`Added User ${savedUser.displayName} to database`);
            done(null, newUser);
        }
    }  catch (error) {
        console.error(error);
    }
}));

// Passport for Microsoft OneDrive
passport.use(new MicrosoftStrategy({
    clientID: process.env.ONEDRIVE_CLIENT_ID,
    clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_BASE_URL} + /auth/microsoft/callback`,
    scope: ['user.read']
},
async function(accessToken, refreshToken, profile, done) {
    try{
        // Check if the User already exists
        const existingUser = await User.findOne({ profileId: profile.id });
        // If they do, attempt to redirect them to the dashboard immediately
        if (existingUser) {
            done(null, existingUser);
        } else {
            // If not, create a new User and add it to the profile database before attempting to redirect the user
            const newUser = new User({
                profileId: profile.id,
                cloudProvider: profile.provider,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                threshold: 0.8
            });
            const savedUser = await newUser.save();
            console.log(`Added User ${savedUser.displayName} to database`);
            done(null, newUser);
        }
    }  catch (error) {
        console.error(error);
    }
}));