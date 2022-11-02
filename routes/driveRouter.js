// Local imports
const auth = require('../auth');
const DriveController = require('../controller/drive-controller');

// Import modules
const express = require('express');
const router = express.Router();

// Create a File Snapshot of the user's drive
router.post('/snapshot/create', auth.verify, DriveController.createFileSnapshot);

// Delete all files stored in the database
// router.get('/deleteFiles', DriveController.deleteFiles);

module.exports = router;