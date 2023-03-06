const express = require('express');
const router = express.Router();
const connection = require('./connection')
const devices = require('./devices')

router.get('/check', connection);
router.post('/devices', devices);

module.exports = router;