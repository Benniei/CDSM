// Local imports
const auth = require('../auth');
const DriveController = require('../controller/drive-controller');

// Import modules
const express = require('express');

const router = express.Router();

router.get('/snapshot/:id', auth.verify, DriveController.dummy);

module.exports = router;