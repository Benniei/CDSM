// Local imports
const DriveController = require('../controller/google-drive-controller');

// Import modules
const express = require('express');

// Create router instance
const router = express.Router();

// Create a File Snapshot of the user's drive
router.get('/createFileSnapshot', DriveController.createFileSnapshot);

// Delete all files stored in the database
// router.get('/deleteFiles', DriveController.deleteFiles);

module.exports = router;