const express = require('express')
const router = express.Router()
const persoValidate = require('./persoValidate')
const perso = require('./perso')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')
const requestMiddelware = require('../../middleware/requestMiddelware')

const {
    perso_rules,
    validate_rules,
    validate
} = require('./validator')

router.post('/', jwtFerify, perso_rules(), validate, operationalMiddelware, requestMiddelware, perso);
router.post('/validate', jwtFerify, validate_rules(), validate, operationalMiddelware, persoValidate);

module.exports = router;