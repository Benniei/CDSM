// Import modules
const express = require('express');
const passport = require('passport');

// Create router instance
const router = express.Router();

// Attempt authentication with Google during login; "prompt: 'select_account'" forces account selection screen to appear every time
router.get('/auth/google', passport.authenticate('google', { accessType: 'offline', prompt: 'select_account', scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive'] } ));
// Redirect based on Google authentication response
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: process.env.CLIENT_BASE_URL }), function(req, res) {
    // Upon successful authentication, redirect to dashboard
    console.log("Successfully authenticated with google.");
    res.redirect(process.env.CLIENT_BASE_URL + 'dashboard');
    // res.redirect('http://localhost:3000/dashboard');
});

router.get('/auth/microsoft', passport.authenticate('microsoft', { accessType: 'offline', prompt: 'select_account', scope: 'user.read' } ));
router.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: process.env.CLIENT_BASE_URL }), function(req, res) {
    console.log("Successfully authenticated with microsoft.");
    res.redirect(process.env.CLIENT_BASE_URL + 'dashboard');
    // res.redirect('http://localhost:3000/dashboard');
});

// Terminate login session and redirect the user to the landing page
router.get('/logout', function(req, res, next) {
    // Terminate login session
    req.logout(function(error) {
        if (error) {
            return next(error);
        }
        // Redirect user to landing page
        console.log('User logged out.');
        res.redirect(process.env.CLIENT_BASE_URL);
        // res.redirect('http://localhost:3000');    
    });
});

// router.get('/test', function(req, res, next) {
//     if (req.user) {
//         console.log(req.user);
//     } else {
//         console.log('User not authenticated.');
//     }
// });

module.exports = router;