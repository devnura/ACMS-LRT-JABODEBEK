// const db = require('../../../config/database')

const service = async (c_setting, trx) => {

    const rows = await trx('sot.t_m_setting').first('e_setting').where({
        c_setting: c_setting,
        b_active: true
    })

    return rows
}

module.exports = service;