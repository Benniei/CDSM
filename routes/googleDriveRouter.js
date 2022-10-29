// Local imports
const DriveController = require('../controller/google-drive-controller');

// Import modules
const express = require('express');

// Create router instance
const router = express.Router();

// Create a File Snapshot of the user's drive
router.post('/snapshot/create', DriveController.createFileSnapshot);

router.post('/snapshot/:id/:folderid', DriveController.getFolder);

// Delete all files stored in the database
// router.get('/deleteFiles', DriveController.deleteFiles);

const AnalysisController = require('../controller/analyze-controller');
// Perform sharing analysis on a map of files, and update their documents accordingly
router.get('/sharingAnalysis', AnalysisController.sharingAnalysis);

module.exports = router;