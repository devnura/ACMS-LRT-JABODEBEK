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

router.post('/', jwtFerify, operationalMiddelware, replacement_rules(), validate, requestMiddelware, replacement);
router.post('/validate', jwtFerify, operationalMiddelware, validate_rules(), validate, replacementValidate);

module.exports = router;