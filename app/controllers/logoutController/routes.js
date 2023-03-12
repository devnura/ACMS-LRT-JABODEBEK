const express = require('express')
const router = express.Router()
const logout = require('./logout')
const jwtFerify = require('../../middleware/jwtFerify')

const {
    logout_rules,
    validate
} = require('./validator')

router.post('/', jwtFerify, logout_rules(), validate, logout);

module.exports = router;