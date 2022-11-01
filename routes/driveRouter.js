// Local imports
const auth = require('../auth');
const DriveController = require('../controller/drive-controller');

// Import modules
const express = require('express');

const router = express.Router();

router.post('/snapshot', auth.verify, DriveController.getSnapshot);

module.exports = router;