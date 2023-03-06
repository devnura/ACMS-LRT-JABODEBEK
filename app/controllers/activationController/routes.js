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

router.post('/', jwtFerify, operationalMiddelware, activation_rules(), validate, requestMiddelware, activation);
router.post('/validate', jwtFerify, operationalMiddelware, validation_rules(), validate, activationValidate);

module.exports = router;