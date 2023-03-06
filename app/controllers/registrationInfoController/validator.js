const {
    check,
    validationResult
} = require('express-validator')

const registrationInfo_rules = () => {
    return [
        check('c_registration_code').notEmpty().withMessage('c_registration_code is require!'),
    ]
}

const validate = async (req, res, next) => {
    const errors = await validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(500).json({
            status: '98',
            message: errors.array()[0].msg,
            data: {}
        });
    }
    req = req.body
    next()
}

module.exports = {
    registrationInfo_rules,
    validate
}