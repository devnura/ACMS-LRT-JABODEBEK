const express = require('express')
const router = express.Router()
const addstock = require('./addStock')

const {
    addstock_rules,
    validate
} = require('./validator')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')
const requestMiddelware = require('../../middleware/requestMiddelware')

router.post('/', jwtFerify, addstock_rules(), validate, operationalMiddelware, requestMiddelware, addstock)

module.exports = router