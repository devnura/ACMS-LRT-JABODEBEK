// const trx = require('../../../config/database')

const service = async (body, trx) => {
    const rows = await trx.first('tmc.c_card_number', 'tmc.c_uid', 'tmc.i_perso_status', 'tmc.i_blacklist_status', 'tmc.b_already_used', 'tmc.b_active', 'tmc.i_card_type', 'tmct.n_card_type', 'tmc.c_card_version_code', 'tmc.n_card_security_code', 'tmc.i_issuer', trx.raw("TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') AS d_perso_at"))
        .from('ecms.t_m_card AS tmc')
        .leftJoin('sot.t_m_card_type AS tmct', function () {
            this.on('tmct.i_card_type', '=', 'tmc.i_card_type')
        })
        .where({
            'tmc.c_uid' : body.c_uid,
            'tmc.b_active': true
        })
    return rows
}

module.exports = service;