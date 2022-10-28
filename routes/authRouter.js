// Import modules
const auth = require('../auth')
const express = require('express');
const jwt = require("jsonwebtoken")
const passport = require('passport');

const User = require('../models/user-model');

// Create router instance
const router = express.Router();

// Attempt authentication with Google during login; "prompt: 'select_account'" forces account selection screen to appear every time
router.get('/auth/google', passport.authenticate('google', { accessType: 'offline', prompt: 'select_account', scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive'] } ));
// Redirect based on Google authentication response
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: process.env.CLIENT_BASE_URL }), function(req, res) {
    // Upon successful authentication, redirect to dashboard
    console.log("Successfully authenticated with google.");
    const token = auth.signToken(req.session.passport.user);
    res.cookie('token', token, { maxAge: null, httpOnly: false });
    res.redirect(process.env.CLIENT_BASE_URL + 'dashboard');
    // res.redirect('http://localhost:3000/dashboard');
});

router.get('/auth/microsoft', passport.authenticate('microsoft', { accessType: 'offline', prompt: 'select_account', scope: 'user.read' } ));
router.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: process.env.CLIENT_BASE_URL }), function(req, res) {
    console.log("Successfully authenticated with microsoft.");
    res.redirect(process.env.CLIENT_BASE_URL + 'dashboard');
    // res.redirect('http://localhost:3000/dashboard');
});


// Checks if session exists, if yes, returns user.
router.get('/loggedIn', function(req, res, next) {
    // Terminate login session
    console.log(req.cookies);
    if(req.cookies.token){
        auth.verify(req, res, async function () {
            let verified = null;
            let loggedInUser = null;
            if(req.cookies.token) {
                verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
                loggedInUser = await User.findOne({ _id: verified.userId });
            }
            else{
                loggedInUser = await User.findOne({ _id: req.userId });
            }
            if(loggedInUser){
                return res.status(200).json({
                    loggedIn: true,
                    user: loggedInUser
                });
            }
        })
    }
    else{
        return res.status(400).json({
            errorMessage: "Not Logged In"
        }).send();
    };
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
        res.clearCookie('cookieName');
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