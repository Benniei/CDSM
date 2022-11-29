// Import modules
const express = require('express');
const jwt = require("jsonwebtoken");
const passport = require('passport');

// Local imports
const auth = require('../auth');
const User = require('../models/user-model');

// Create router instance
const router = express.Router();

// Authenticate user with Google
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

// Authenticate user with Microsoft
router.get('/auth/microsoft', passport.authenticate('microsoft', { accessType: 'offline', prompt: 'select_account', scope: ['user.read', 'offline_access'] } ));
// Redirect based on Microsoft authentication response
router.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: process.env.CLIENT_BASE_URL }), function(req, res) {
    console.log("Successfully authenticated with microsoft.");
    const token = auth.signToken(req.session.passport.user);
    res.cookie('token', token, { maxAge: null, httpOnly: false });
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
            if (req.cookies.token) {
                verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
                loggedInUser = await User.findOne({ _id: verified.userId }, '-profileId -refreshToken -__v');
            } else {
                loggedInUser = await User.findOne({ _id: req.userId }, '-profileId -refreshToken -__v');
            }
            if (loggedInUser) {
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
        res.clearCookie('token');
        res.redirect(process.env.CLIENT_BASE_URL);
        // res.redirect('http://localhost:3000');    
    });
});

module.exports = router;