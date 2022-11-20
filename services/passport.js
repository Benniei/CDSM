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
    User.findById(id, '-profileId -refreshToken -__v', function(err, user) {
        done(err, user);
    });
});

// Passport for Google OAuth2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_BASE_URL}auth/google/callback`,
    proxy: true
},
async function(accessToken, refreshToken, profile, done) {
    try{
        // Check if the User already exists
        let user = await User.findOne({ cloudProvider: profile.provider, profileId: profile.id });
        // If they do, attempt to redirect them to the dashboard immediately
        if (user) {
            console.log(`User (${profile.provider}, ${profile.id}) found.`);
            // Update document with new refresh token if any
            if (refreshToken) {
                user = await User.findOneAndUpdate({ _id: user._id }, { $set:{ refreshToken:refreshToken } }, { fields: '-profileId -refreshToken -__v', returnDocument: 'after' });
            }
            done(null, user);
        } else {
            // If not, create a new User and add it to the profile database before attempting to redirect the user
            const newUser = new User({
                profileId: profile.id,
                cloudProvider: profile.provider,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                refreshToken: refreshToken,
                threshold: 0.8
            });
            await User.create(newUser);
            user = await User.findOne({ cloudProvider: profile.provider, profileId: profile.id }, '-profileId -refreshToken -__v');
            console.log(`Added User (${profile.provider}, ${profile.id}) to database`);
            done(null, user);
        }
    }  catch (error) {
        console.error(error);
    }
}));

// Passport for Microsoft OneDrive
passport.use(new MicrosoftStrategy({
    clientID: process.env.ONEDRIVE_CLIENT_ID,
    clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_BASE_URL}auth/microsoft/callback`
},
async function(accessToken, refreshToken, profile, done) {
    try{
        // Check if the User already exists
        let user = await User.findOne({ cloudProvider: profile.provider, profileId: profile.id });
        // If they do, attempt to redirect them to the dashboard immediately
        if (user) {
            console.log(`User (${profile.provider}, ${profile.id}) found.`);
            // Update document with new refresh token if any
            if (refreshToken) {
                user = await User.findOneAndUpdate({ _id: user._id }, { $set:{ refreshToken:refreshToken } }, { fields: '-profileId -refreshToken -__v', returnDocument: 'after' });
            }
            done(null, user);
        } else {
            // If not, create a new User and add it to the profile database before attempting to redirect the user
            const newUser = new User({
                profileId: profile.id,
                cloudProvider: profile.provider,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                refreshToken: refreshToken,
                threshold: 0.8
            });
            await User.create(newUser);
            user = await User.findOne({ cloudProvider: profile.provider, profileId: profile.id }, '-profileId -refreshToken -__v');
            console.log(`Added User (${profile.provider}, ${profile.id}) to database`);
            done(null, user);
        }
    }  catch (error) {
        console.error(error);
    }
}));