const express = require('express')
const router = express.Router()
const registrationInfo = require('./registrationInfo')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')

const {
    registrationInfo_rules,
    validate
} = require('./validator')

router.post('/info', jwtFerify, operationalMiddelware, registrationInfo_rules(), validate, registrationInfo);

module.exports = router;