// Import modules
const express = require('express');

// Local imports
const auth = require('../auth');
const AnalysisController = require('../controller/analyze-controller');
const DriveController = require('../controller/drive-controller');

// Create router instance
const router = express.Router();

// Create a FileSnapshot of the user's drive
router.post('/snapshot/create', auth.verify, DriveController.createFileSnapshot);

// Retrieve a FileSnapshot given its Id 
router.post('/snapshot', auth.verify, DriveController.getSnapshot);

// Retrieve files given their Ids and their FileSnapshot
router.post('/snapshot/:snapshotId/files', auth.verify, DriveController.getFiles);

// Retrieve the file content of a folder given its Id
router.post('/snapshot/:snapshotId/:folderId', auth.verify, DriveController.getFolder);

// Perform sharing changes analysis on the two given FileSnapshots
router.post('/snapshots/:snapshot1/:snapshot2/analyze', auth.verify, AnalysisController.snapshotAnalysis);

// Delete all files stored in the database
router.get('/deleteFiles', DriveController.deleteFiles);

module.exports = router;