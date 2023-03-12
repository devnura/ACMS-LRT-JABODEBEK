const express = require('express')
const router = express.Router()
const activation = require('./activation')
const activationValidate = require('./activationValidate')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')
const requestMiddelware = require('../../middleware/requestMiddelware')

const {
    activation_rules,
    validation_rules,
    validate
} = require('./validator')

router.post('/', jwtFerify, activation_rules(), validate, operationalMiddelware, requestMiddelware, activation);
router.post('/validate', jwtFerify, validation_rules(), validate, operationalMiddelware, activationValidate);

module.exports = router;