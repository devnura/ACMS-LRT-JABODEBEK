const express = require('express')
const router = express.Router()
const addstock = require('./addStock')

const {
    addstock_rules,
    validate
} = require('./validator')

const jwtFerify = require('../../middleware/jwtFerify')
const operationalMiddelware = require('../../middleware/operationalMiddelware')

router.post('/', jwtFerify, addstock_rules(), validate, operationalMiddelware, addstock)

module.exports = router