// const db = require('../../../config/database')

const service = async (i_card_type, c_card_number, trx) => {
    const rows = await trx('ecms.t_m_card')
        .first('b_active', 'i_blacklist_status')
        .where({
            i_card_type: i_card_type,
            c_card_number: c_card_number,
            b_active: true
        })

    if (!rows) return false

    return rows
}

module.exports = service;