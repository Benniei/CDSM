// Import modules
const express = require('express');
const passport = require('passport');

// Create router instance
const router = express.Router();

// Scope options to retrieve the user's Google profile and email addresses
const scopeGoogle = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];
const scopeMicrosoft = ["user.read"]

// Attempt authentication with Google during login; "prompt: 'select_account'" forces account selection screen to appear every time
router.get('/auth/google', passport.authenticate('google', { prompt: 'select_account', scope: scopeGoogle } ));
// Redirect based on Google authentication response
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: process.env.CLIENT_BASE_URL }), function(req, res) {
    // Upon successful authentication, redirect to dashboard
    res.redirect(process.env.CLIENT_BASE_URL + '/dashboard');
    console.log("Successfully authenticated with google.");
});

router.get('/auth/onedrive', passport.authenticate('onedrive', {scope: scopeMicrosoft}));
router.get('/auth/onedrive/callback', passport.authenticate('onedrive', { failureRedirect: process.env.CLIENT_BASE_URL }), function(req, res) {
    // Successful authentication, redirect to dashboard.
    res.redirect(process.env.CLIENT_BASE_URL + '/dashboard');
    console.log("Successfully authenticated with onedrive.");
});

module.exports = router;