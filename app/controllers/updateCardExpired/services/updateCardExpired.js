
const service = async (body, trx) => {
    let station =  await trx('opr.t_m_station').first('n_station').where({
        c_station: body.c_station
    })

    if (body.c_status == "00") {

        await trx('ecms.t_m_card_owner_detail')
            .update({
                d_active_date: body.d_active_date,
                d_expired_date: body.d_expired_date,
            })
            .where({
                c_registration_code: body.c_registration_code,
                b_active: true
            })

    }

    const result = await trx('ecms.t_d_trx_update_card_expired').insert({
        i_card_registration: body.i_card_registration,
        c_registration_code: body.c_registration_code,
        n_identity_number: body.n_identity_number,
        i_card_type: body.i_card_type, 
        c_uid: body.c_uid,
        c_card_number: body.c_card_number,
        c_specific_station: body.c_specific_station != "" ? body.c_specific_station : null,
        i_card_active_time_in_days: body.i_card_active_time_in_days,
        d_active_date: body.d_active_date,
        d_expired_date: body.d_expired_date,
        n_update_card_expired: body.n_update_card_expired,
        d_update_card_expired: body.d_update_card_expired,
        c_pos: body.c_pos,
        c_station: body.c_station,
        n_station: station.n_station,
        c_reader: body.c_reader,
        c_status: body.c_status,
        c_desc: body.c_desc,
        c_login: body.c_login
    }, [
        "n_identity_number",
        "c_registration_code",
        "i_card_type",
        "c_card_number",
        "c_uid",
        "d_active_date",
        "d_expired_date",
        "n_update_card_expired",
        "d_update_card_expired",
    ])

    return result
}

module.exports = service;