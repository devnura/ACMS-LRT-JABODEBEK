const {
    check,
    validationResult
} = require('express-validator')
const helper = require("../../helpers/helper")
const winston = require("../../helpers/winston.logger");

const addstock_rules = () => {
    return [
        check('c_login').notEmpty().withMessage('c_login is required.').escape().trim(),
        check('c_station').notEmpty().withMessage('c_station is required.').escape().trim(),
        check('n_station').notEmpty().withMessage('n_station is required.').escape().trim(),
        check('c_pos').notEmpty().withMessage('c_pos is required.').escape().trim(),
        check('n_username').notEmpty().withMessage('n_username is required.').escape().trim(),
        check('e_fullname').notEmpty().withMessage('e_fullname is required.').escape().trim(),
        // check('m_cash').notEmpty().withMessage('m_cash is required.'),
        check('q_employee_card').notEmpty().withMessage('q_employee_card is required.').escape().trim(),
        check('q_master_card').notEmpty().withMessage('q_master_card is required.').escape().trim(),
        check('q_tenant_card').notEmpty().withMessage('q_tenant_card is required.').escape().trim(),
        // check('q_bni_card').notEmpty().withMessage('q_bni_card is required.'),
        // check('q_bri_card').notEmpty().withMessage('q_bri_card is required.'),
        // check('q_mandiri_card').notEmpty().withMessage('q_mandiri_card is required.'),
        // check('q_bca_card').notEmpty().withMessage('q_bca_card is required.'),
        // check('q_dki_card').notEmpty().withMessage('q_dki_card is required.'),
        check('c_unique').notEmpty().withMessage('c_unique_code is required.').escape().trim(),
        check('d_addstock_at').notEmpty().withMessage('d_addstock_at is required.').isISO8601().withMessage("Invalid d_addstock_at format, except YYYY-MM-DD HH:MM:SS").escape().trim(),
    ]
}

const validate = async (req, res, next) => {
    const errors = await validationResult(req)

    const requestId = helper.getUniqueCode()
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`  
    // log info
    winston.logger.info(
        `${requestId} ${requestUrl} REQUEST : ${JSON.stringify(req.body)}`
    );

    if (!errors.isEmpty()) {
        const result ={
            status: '98',
            message: errors.array()[0].msg,
            data: {}
        }

        // log warn
        winston.logger.warn(
            `${requestId} ${requestUrl} [validate] RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(500).json(result);
    }

    req.requestId = requestId
    req.requestUrl = requestUrl
    
    next()
}

module.exports = {
    addstock_rules,
    validate
}