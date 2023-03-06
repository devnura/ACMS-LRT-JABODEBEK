const db = require('../config/database');
const moment = require('moment');

module.exports = {
    getMessage: async function (_status) {
        let message = await db.raw(`
        SELECT
            coalesce(n_desc_ina, '') as n_desc_ina,
            coalesce(n_desc_eng, '') as n_desc_eng
        FROM
            sot.t_m_desc_pos_vm
        WHERE
            c_status = '${_status}'
        `)
        return message.rows[0];
    },
    error: async function (res, _message) {
        return res.status(200).send({ 
            status: "500",
            message: {
                ina: 'ERROR!',
                eng: 'ERROR!'
            },
            data: {
                message: _message
            }
        });
    },
    success: async function (res, _status, _data) {
        let _message = await this.getMessage(_status);
        return res.status(200).send({
            status: _status,
            message: {
                ina: _message.n_desc_ina,
                eng: _message.n_desc_eng
            },
            data: _data
        });
    },
};