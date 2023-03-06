const {
    check
} = require('express-validator')

module.exports = [
    check('username').notEmpty().withMessage('Username harus terisi!').escape().trim(),
    check('password').notEmpty().withMessage('Password harus terisi')
    .isLength({
        min: 5
    }).withMessage('Password harus lebih dari 5 karakter').escape().trim(),
    check('c_pos').notEmpty().withMessage('Username harus terisi!').escape().trim(),
    check('d_logout_at').notEmpty().withMessage('d_logout_at harus terisi!').isISO8601().withMessage('invalid format d_logout_at YYYY-MM-DD hh:mm:ss !').escape().trim(),
]