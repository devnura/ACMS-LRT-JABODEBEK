const express = require('express')
const router = express.Router()
const updateCardExpired = require('./updateCardExpired')
const updateCardExpiredValidate = require('./updateCardExpiredValidate')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')
const requestMiddelware = require('../../middleware/requestMiddelware')

const {
    update_rules,
    validation_rules,
    validate
} = require('./validator')

router.post('/', jwtFerify, operationalMiddelware, update_rules(), validate, requestMiddelware, updateCardExpired);
router.post('/validate', jwtFerify, operationalMiddelware, validation_rules(), validate, updateCardExpiredValidate);

module.exports = router;