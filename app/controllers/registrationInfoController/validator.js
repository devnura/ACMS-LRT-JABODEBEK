const {
    check,
    validationResult
} = require('express-validator')

const helper = require("../../helpers/helper")
const winston = require("../../helpers/winston.logger");

const registrationInfo_rules = () => {
    return [
        check('c_registration_code').notEmpty().withMessage('c_registration_code is require!'),
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
    registrationInfo_rules,
    validate
}