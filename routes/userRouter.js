// Local imports
const auth = require('../auth');
const express = require('express');
const UserController = require('../controller/user-controller');
const AnalysisController = require('../controller/analyze-controller');

// Create router instance
const router = express.Router();

// Non-Specific Drive Routes
router.post('/snapshot', auth.verify, UserController.getSnapshot);
router.post('/snapshot/:id/:folderid', UserController.getFolder);
// Perform sharing analysis on a map of files, and update their documents accordingly
router.get('/sharingAnalysis', AnalysisController.sharingAnalysis);

// User Routes
router.post('/acr', auth.verify, UserController.updateACR);
router.get('/snapshot/list', auth.verify, UserController.listSnapshots);

module.exports = router;