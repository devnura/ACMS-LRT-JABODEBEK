// const db = require('../../../config/database')

const service = async (c_card_number, c_uid, trx) => {
    const rows = await trx.first(
            'tdtcr.i_id',
            'tmco.n_fullname',
            'tmco.n_company_name',
            'tmet.n_employee_type_name',
            'tmcod.b_active',
            'tmcod.c_uid',
            'tmcod.c_card_number',
            'tmcod.i_card_type',
            'tmct.n_card_type',
            'tmcod.c_registration_code',
            trx.raw('NOW() AS date_on_server'),
            'tmcod.i_card_type',
            'tmit.n_identity_type_code',
            'tmcod.n_identity_number',
            trx.raw('TRIM(tmcod.c_specific_station) as c_specific_station'),
            'tms.n_station as n_specific_station',
            trx.raw(`CASE
            WHEN tmcod.i_card_active_time_in_days IS NOT NULL
                THEN tmcod.i_card_active_time_in_days 
            WHEN tmcod.i_card_active_time_in_days IS NULL
                THEN (select e_setting from sot.t_m_setting where c_setting = 'ECMS02')::smallint
        END i_card_active_time_in_days`),
            'tmcod.d_active_date'
        )
        .from('ecms.t_m_card_owner_detail AS tmcod')
        .leftJoin('sot.t_m_card_type AS tmct', function () {
            this.on('tmct.i_card_type', '=', 'tmcod.i_card_type')
        })
        .leftJoin('ecms.t_m_card_owner AS tmco', function () {
            this.on('tmco.n_identity_number', '=', 'tmcod.n_identity_number')
        })
        .leftJoin('ecms.t_m_employee_type AS tmet', function () {
            this.on('tmet.i_id', '=', 'tmco.i_employee_type')
        })
        .leftJoin('ecms.t_m_identity_type AS tmit', function () {
            this.on('tmit.i_id', '=', 'tmco.i_identity_type')
        })
        .leftJoin('ecms.t_d_trx_card_registration AS tdtcr', function () {
            this.on('tdtcr.n_identity_number', '=', 'tmcod.n_identity_number')
        })
        .leftJoin('opr.t_m_station AS tms', function () {
            this.on('tms.c_station', '=', 'tmcod.c_specific_station')
        })
        .where({
            'tmcod.c_card_number': c_card_number,
            'tmcod.c_uid': c_uid,
            'tmcod.b_active': true,
        })

    return rows

}

module.exports = service;