const express = require('express')
const router = express.Router()
const login = require('./openShift')
const loginInfo = require('./loginInfo')
const jwtFerify = require('../../middleware/jwtFerify')

const {
    login_rules,
    login_info_rules,
    validate
} = require('./validator')

router.post('/', login_rules(), validate, login);
router.post('/info', jwtFerify, login_info_rules(), validate, loginInfo);

module.exports = router;