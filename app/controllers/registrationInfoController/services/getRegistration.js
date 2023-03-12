const service = async (body, trx) => {
    const rows = await trx
        .first(
            'tdtcr.n_identity_number',
            'tmco.n_fullname',
            trx.raw('TRIM(tdtcr.c_registration_code) AS c_registration_code'),
            trx.raw('TRIM(tdtcr.c_specific_station) AS c_specific_station'),
            trx.raw('TRIM(tmcod.c_specific_station) as c_specific_station'),
            'tms.n_station as n_specific_station',
            'tmcod.c_card_number',
            'tmco.n_company_name',
            'tdtcr.d_activation',
            "tmcod.i_card_type",
            "tmct.n_card_type",
            trx.raw(`CASE
                WHEN tmcod.i_card_active_time_in_days IS NOT NULL
                    THEN tmcod.i_card_active_time_in_days 
                WHEN tmcod.i_card_active_time_in_days IS NULL
                    THEN (select e_setting from sot.t_m_setting where c_setting = 'ECMS01')::smallint
            END i_card_active_time_in_days`),
            "tdtcr.b_active",
        )
        .from('ecms.t_d_trx_card_registration AS tdtcr')
        .leftJoin('ecms.t_m_card_owner AS tmco', function () {
            this.on('tmco.n_identity_number', '=', 'tdtcr.n_identity_number')
        })
        .leftJoin('ecms.t_m_card_owner_detail AS tmcod', function () {
            this.on('tmcod.n_identity_number', '=', 'tmco.n_identity_number')
        })
        .leftJoin('opr.t_m_station AS tms', function () {
            this.on('tms.c_station', '=', 'tmcod.c_specific_station')
        })
        .leftJoin('sot.t_m_card_type AS tmct', function () {
            this.on('tmct.i_card_type', '=', 'tmcod.i_card_type')
        })
        .where({
            "tdtcr.b_active": true,
            "tmcod.b_active": true
        })
        .whereRaw(`(tdtcr.c_registration_code = '${ body.c_registration_code }' OR tdtcr.n_identity_number = '${ body.c_registration_code }')`)

    if (!rows) return false

    return rows
}

module.exports = service;