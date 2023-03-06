// const db = require('../../../config/database')

const service = async (c_registration_code, trx) => {
    console.log(`[*] Getting card t_m_card_owner_detail.. `)

    const rows = await trx
        .first(
            trx.raw('tmcod.i_card_type::varchar'),
            trx.raw("TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') AS d_replacement_at"),
            'tmco.n_identity_number',
            'tmco.n_fullname',
            'tmcod.c_registration_code',
            'tmco.n_company_name',
            'tmct.n_card_type',
            'tmcod.c_uid',
            'tmcod.c_card_number',
            trx.raw("COALESCE(TRIM(tmcod.c_specific_station), '') AS c_specific_station"),
            trx.raw("COALESCE(tms.n_station, '') AS c_specific_station_name"),
            trx.raw('tmcod.d_registration'),
            trx.raw('tmcod.d_active_date'),
            trx.raw("COALESCE(tmcod.d_expired_date::varchar, '') AS d_expired_date"),
            trx.raw(`CASE
            WHEN tmcod.i_card_active_time_in_days IS NOT NULL
                THEN tmcod.i_card_active_time_in_days 
            WHEN tmcod.i_card_active_time_in_days IS NULL
                THEN (select e_setting from sot.t_m_setting where c_setting = 'ECMS02')::smallint
        END i_card_active_time_in_days`),
            "tmcod.b_active",
        )
        .from('ecms.t_m_card_owner AS tmco')
        .leftJoin('ecms.t_m_card_owner_detail AS tmcod', function () {
            this.on('tmcod.n_identity_number', '=', 'tmco.n_identity_number')
        })
        .leftJoin('sot.t_m_card_type AS tmct', function () {
            this.on('tmct.i_card_type', '=', 'tmcod.i_card_type')
        })
        .leftJoin('opr.t_m_station AS tms', function () {
            this.on('tms.c_station', '=', 'tmcod.c_specific_station')
        })
        .leftJoin('ecms.t_d_trx_card_registration AS tdtcr', function () {
            this.on('tdtcr.c_registration_code', '=', 'tmcod.c_registration_code')
            this.on('tdtcr.c_card_number', '=', 'tmcod.c_card_number')
        })
        .where({
            "tmcod.c_registration_code": c_registration_code,
            "tmcod.b_active": true,
        })
        .orWhere({
            "tmcod.n_identity_number": c_registration_code,
            "tmcod.b_active": true,
        })

    console.log('[*] Result : ', rows)

    return rows
}

module.exports = service;