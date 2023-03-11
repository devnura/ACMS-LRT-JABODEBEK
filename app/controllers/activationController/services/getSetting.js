// const db = require('../../../config/database')

const service = async (c_setting, trx) => {
    const rows = await trx('sot.t_m_setting').first(['e_setting', 'd_approved_at'])
    .where({
        c_setting: c_setting,
        b_active: true,
        d_end : null,
        // e_approved_by : "1"
    })
    .whereNotNull('d_approved_at')
    return rows
}

module.exports = service;