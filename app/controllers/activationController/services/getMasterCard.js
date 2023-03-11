const service = async (body, trx) => {

    const rows = await trx
        .first(
            'tmc.c_uid',
            'tmc.i_card_type',
            trx.raw('TRIM(tmc.c_card_number) AS c_card_number, COALESCE(tmc.i_perso_status, 0)::VARCHAR as i_perso_status, tmc.i_card_type::VARCHAR'),
            'tmc.b_active',
            'tmct.n_card_type',
            'tmc.b_already_used',
            'tmc.i_blacklist_status',
            'tmc.c_card_version_code',
            'tmc.n_card_security_code',
            'tmc.i_issuer',
            trx.raw('COALESCE(tmc.i_perso_status, 0)::text AS i_perso_status'),
            'tmc.b_active'
        )
        .from('ecms.t_m_card AS tmc')
        .leftJoin('sot.t_m_card_type AS tmct', function () {
            this.on('tmct.i_card_type', '=', 'tmc.i_card_type')
        })
        .where({
            'tmc.c_uid': body.c_uid,
            'tmc.b_active': true
        })
        
    return rows
}

module.exports = service;