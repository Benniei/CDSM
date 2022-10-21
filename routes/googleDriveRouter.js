// Local imports
const DriveController = require('../controller/google-drive-controller');

// Import modules
const express = require('express');

// Create router instance
const router = express.Router();

// Retrieves file data for all files in user's drive
router.get('/getFiles', DriveController.getFiles);

module.exports = router;