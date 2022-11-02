// Local imports
const auth = require('../auth');
const express = require('express');
const UserController = require('../controller/user-controller');

// Create router instance
const router = express.Router();

router.post('/acr', auth.verify, UserController.updateACR);