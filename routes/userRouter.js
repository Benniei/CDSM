// Import modules
const express = require('express');

// Local imports
const auth = require('../auth');
const UserController = require('../controller/user-controller');

// Create router instance
const router = express.Router();

// User Routes
router.post('/acr', auth.verify, UserController.updateACR);
router.post('/buildQuery', auth.verify, UserController.buildQuery);
router.post('/doQuery', auth.verify, UserController.doQuery);
router.get('/snapshot/list', auth.verify, UserController.listSnapshots);

module.exports = router;