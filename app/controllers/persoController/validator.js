const {
    check,
    validationResult
} = require('express-validator')

const validate_rules = () => {
    return [
        check('c_uid').notEmpty().withMessage('c_uid is require!'),
    ]
}

const perso_rules = () => {

    return [
        check('c_uid').notEmpty().withMessage('c_uid is require!'),
        check('c_card_number').notEmpty().withMessage('c_card_number is require!'),
        check('c_login').notEmpty().withMessage('c_login is require!'),
        check('i_card_type').notEmpty().withMessage('i_card_type is require!'),
        check('n_card_type').notEmpty().withMessage('n_card_type is require!'),
        check('n_perso').notEmpty().withMessage('n_perso is require!'),
        check('c_pos').notEmpty().withMessage('c_pos is require!'),
        check('c_station').notEmpty().withMessage('c_station is require!'),
        check('c_reader').notEmpty().withMessage('c_reader is require!'),
        check('c_unique').notEmpty().withMessage('c_unique is require!')
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
    perso_rules,
    validate_rules,
    validate
}