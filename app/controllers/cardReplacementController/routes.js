const express = require('express')
const router = express.Router()
const replacement = require('./replacement')
const replacementValidate = require('./replacementValidate')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')
const requestMiddelware = require('../../middleware/requestMiddelware')

const {
    replacement_rules,
    validate_rules,
    validate
} = require('./validator')

router.post('/', jwtFerify, replacement_rules(), validate, operationalMiddelware, requestMiddelware, replacement);
router.post('/validate', jwtFerify, validate_rules(), validate, operationalMiddelware, replacementValidate);

module.exports = router;