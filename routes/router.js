const auth = require('../auth')
const express = require('express')
// Controllers go here
const DriveController = require('../controller/drive-controller')
const router = express.Router()

router.get('/snapshot/:id', auth.verify, DriveController.dummy)

module.exports = router;