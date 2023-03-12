const db = require('../../../config/database')

const service = async (body) => {
    const rows = await db
        .first(
            db.raw(`(SELECT b_already_used FROM ecms.t_m_card WHERE c_uid = '${body.c_uid}' AND c_card_number = '${body.c_card_number}') AS b_already_used`),
            'd_activation',
        )
        .from('ecms.t_d_trx_card_registration')
        .where({
            'n_identity_number': body.n_identity_number,
            'c_registration_code': body.c_registration_code,
        })
    if (!rows) return false
    return rows
}

module.exports = service;