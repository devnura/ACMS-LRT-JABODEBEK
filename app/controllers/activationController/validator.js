const {
    check,
    validationResult
} = require('express-validator')
const helper = require("../../helpers/helper")
const winston = require("../../helpers/winston.logger");

const validation_rules = () => {
    return [
        check('c_uid').notEmpty().withMessage('uid is require!'),
        check('i_perso_status').notEmpty().withMessage('i_perso_status is require!'),
        check('c_registration_code').notEmpty().withMessage('c_registration_code is require!'),
    ]
}

const activation_rules = () => {

    return [
        check('c_uid').notEmpty().withMessage('uid is require!'),
        check('c_card_number').notEmpty().withMessage('c_card_number is require!'),
        check('c_login').notEmpty().withMessage('c_login is require!'),
        // check('c_loket').notEmpty().withMessage('c_loket is require!'),
        check('c_pos').notEmpty().withMessage('c_pos is require!'),
        check('c_station').notEmpty().withMessage('c_station is require!'),
        check('c_reader').notEmpty().withMessage('c_reader is require!'),
        check('i_card_type').notEmpty().withMessage('i_card_type is require!'),
        check('n_identity_number').notEmpty().withMessage('n_identity_number is require!'),
        check('c_registration_code').notEmpty().withMessage('c_registration_code is require!'),
        check('c_specific_station').exists({nullable: true}).withMessage('c_specific_station is require!'),
        check('d_expired_date').notEmpty().withMessage('expired_date is require!'),
        check('d_active_date').notEmpty().withMessage('d_active_date is require!'),
        check('i_perso_status').notEmpty().withMessage('i_perso_status is require!'),
        check('c_status').notEmpty().withMessage('c_status is require!'),
        check('c_unique').notEmpty().withMessage('c_unique is require!')
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
    activation_rules,
    validation_rules,
    validate
}