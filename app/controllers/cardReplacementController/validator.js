const {
    check,
    oneOf,
    validationResult
} = require('express-validator')
const helper = require("../../helpers/helper")
const winston = require("../../helpers/winston.logger");

const validate_rules = () => {
    return [
        oneOf([
            check('c_uid').notEmpty(),
            check('c_registration_code').notEmpty(),
        ], 'c_registration_code or c_uid is require!'),
        check('i_perso_status').exists().withMessage('i_perso_status is require!'),
    ]
}

const replacement_rules = () => {

    return [
        check('c_registration_code').notEmpty().withMessage('c_registration_code is require!'),
        check('n_identity_number').notEmpty().withMessage('n_identity_number is require!'),
        check('i_card_type').notEmpty().withMessage('i_card_type is require!'),
        check('c_uid').notEmpty().withMessage('c_uid is require!'),
        check('c_card_number').notEmpty().withMessage('c_card_number is require!'),
        check('c_specific_station').exists().withMessage('c_specific_station is require!'),
        check('i_card_active_time_in_days').notEmpty().withMessage('i_card_active_time_in_days is require!'),
        check('d_active_date').notEmpty().withMessage('d_active_date is require!'),
        check('d_expired_date').notEmpty().withMessage('d_expired_date is require!'),
        check('n_card_replacement').notEmpty().withMessage('n_card_replacement is require!'),
        // check('d_card_replacement').notEmpty().withMessage('d_card_replacement is require!'),
        // check('c_loket').notEmpty().withMessage('c_loket is require!'),
        check('c_pos').notEmpty().withMessage('c_pos is require!'),
        check('c_station').notEmpty().withMessage('c_station is require!'),
        check('c_reader').notEmpty().withMessage('c_reader is require!'),
        check('i_card_replacement_note').notEmpty().withMessage('i_card_replacement_note is require!'),
        check('c_login').notEmpty().withMessage('c_login is require!'),
        check('i_perso_status').notEmpty().withMessage('i_perso_status is require!'),
        check('c_status').notEmpty().withMessage('c_status is require!'),
        check('c_uid_old').notEmpty().withMessage('c_uid_old is require!'),
        check('c_card_number_old').notEmpty().withMessage('c_card-number_old is require!'),
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
    replacement_rules,
    validate_rules,
    validate
}