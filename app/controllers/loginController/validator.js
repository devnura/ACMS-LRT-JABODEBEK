const {
    check,
    validationResult
} = require('express-validator')
const helper = require("../../helpers/helper")
const winston = require("../../helpers/winston.logger");

const login_rules = () => {
    return [
        check('username').notEmpty().withMessage('Username harus terisi!'),
        check('password').notEmpty().withMessage('Password harus terisi')
        .isLength({
            min: 5
        }).withMessage('Password harus lebih dari 5 karakter'),
        check('c_pos').notEmpty().withMessage('Username harus terisi!'),
        check('d_login_at').notEmpty().withMessage('d_login_at harus terisi!').isISO8601().withMessage('invalid d_login_at format YYYY-MM-DD hh:mm:ss !').escape().trim(),
    ]
}
const login_info_rules = () => {
    return [
        check('c_login').notEmpty().withMessage('c_lolgin harus terisi!'),
    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req)

    const requestId = helper.getUniqueCode()
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`  

    if (!errors.isEmpty()) {
        const result = {
            status: '98',
            message: errors.array()[0].msg,
            data: {}
        }

        // log warn
        winston.logger.warn(
            `${requestId} | ${requestUrl} | LOCATION : VALIDATE | RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(403).json(result);
    }
    req.requestId = requestId
    req.requestUrl = requestUrl

    next()
}

module.exports = {
    login_rules,
    login_info_rules,
    validate
}