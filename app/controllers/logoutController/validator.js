const {
    check,
    validationResult
} = require('express-validator')
const helper = require("../../helpers/helper")
const winston = require("../../helpers/winston.logger");

const logout_rules = () => {
    return [
        check('username').notEmpty().withMessage('Username harus terisi!').escape().trim(),
        check('password').notEmpty().withMessage('Password harus terisi')
        .isLength({
            min: 5
        }).withMessage('Password harus lebih dari 5 karakter').escape().trim(),
        check('c_pos').notEmpty().withMessage('Username harus terisi!').escape().trim(),
        check('d_logout_at').notEmpty().withMessage('d_logout_at harus terisi!').isISO8601().withMessage('invalid format d_logout_at YYYY-MM-DD hh:mm:ss !').escape().trim(),
    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req)

    const requestId = helper.getUniqueCode()
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`  
    // log info
    winston.logger.info(
        `${requestId} | ${requestUrl} | REQUEST : ${JSON.stringify(req.body)}`
    );

    if (!errors.isEmpty()) {
        const result ={
            status: '98',
            message: errors.array()[0].msg,
            data: {}
        }

        // log warn
        winston.logger.warn(
            `${requestId} | ${requestUrl} | LOCACTRION : VALIDATE | RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(403).json(result);
    }

    req.requestId = requestId
    req.requestUrl = requestUrl
    
    next()
}

module.exports = {
    logout_rules,
    validate
}