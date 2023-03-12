const {
    check,
    validationResult
} = require('express-validator')
const helper = require("../../helpers/helper")
const winston = require("../../helpers/winston.logger");

const validation_rules = () => {
   
    return [
        check('c_uid').notEmpty().withMessage('uid is require!'),
        check('c_card_number').notEmpty().withMessage('c_card_number is require!'),
        check('d_expired_date_on_card').notEmpty().withMessage('d_expired_date_on_card is require!'),
        // check('c_loket').notEmpty().withMessage('c_loket is require!'),
        check('c_pos').notEmpty().withMessage('c_pos is require!'),
        check('c_station').notEmpty().withMessage('c_station is require!'),
        check('c_reader').notEmpty().withMessage('c_reader is require!'),
        check('n_update_card_expired').notEmpty().withMessage('n_update_card_expired is require!'),
        check('i_card_type').notEmpty().withMessage('i_card_type is require!'),
        // check('n_identity_number').notEmpty().withMessage('n_identity_number is require!'),
    ]
}

const update_rules = () => {

    return [
        check('i_card_registration').notEmpty().withMessage('i_card_registration is require!'),
        check('c_registration_code').notEmpty().withMessage('c_registration_code is require!'),
        check('n_identity_number').notEmpty().withMessage('n_identity_number is require!'),
        check('i_card_type').notEmpty().withMessage('i_card_type is require!'),
        check('c_uid').notEmpty().withMessage('c_uid is require!'),
        check('c_card_number').notEmpty().withMessage('c_card_number is require!'),
        check('c_specific_station').exists().withMessage('c_specific_station is require!'),
        check('i_card_active_time_in_days').notEmpty().withMessage('i_card_active_time_in_days is require!'),
        check('d_active_date').notEmpty().withMessage('d_active_date is require!'),
        check('d_expired_date').notEmpty().withMessage('d_expired_date is require!'),
        check('n_update_card_expired').notEmpty().withMessage('n_update_card_expired is require!'),
        check('d_update_card_expired').notEmpty().withMessage('d_update_card_expired is require!'),
        // check('c_loket').notEmpty().withMessage('c_loket is require!'),
        check('c_pos').notEmpty().withMessage('c_pos is require!'),
        check('c_station').notEmpty().withMessage('c_station is require!'),
        check('n_specific_station').exists().withMessage('n_specific_station is require!'),
        check('c_reader').notEmpty().withMessage('c_reader is require!'),
        check('c_status').notEmpty().withMessage('c_status is require!'),
        check('c_desc').notEmpty().withMessage('c_desc is require!'),
        check('c_unique').notEmpty().withMessage('c_unique is require!')

    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req)

    const requestId = helper.getUniqueCode()
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`  
    // log info
    winston.logger.info(
        `${requestId} ${requestUrl} REQUEST : ${JSON.stringify(req.body)}`
    );

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

        return res.status(500).json(result);
    }
    
    req.requestId = requestId
    req.requestUrl = requestUrl
    
    next()

}

module.exports = {
    update_rules,
    validation_rules,
    validate
}