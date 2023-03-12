const express = require('express')
const router = express.Router()
const registrationInfo = require('./registrationInfo')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')

const {
    registrationInfo_rules,
    validate
} = require('./validator')

router.post('/info', jwtFerify, registrationInfo_rules(), validate, operationalMiddelware, registrationInfo);

module.exports = router;