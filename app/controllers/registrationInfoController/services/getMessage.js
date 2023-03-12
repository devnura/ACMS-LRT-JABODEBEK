// const db = require('../../../config/database')

const service = async (i_card_type, c_trans_type, c_status, trx) => {
    const rows = await trx('sot.t_m_desc')
        .first('n_desc', 'c_status', trx.raw('TRIM(c_desc) as c_desc'))
        .where({
            i_card_type: i_card_type,
            c_trans_type: c_trans_type,
            c_status: c_status,
            b_active: true
        })
    
    return rows
}

module.exports = service;