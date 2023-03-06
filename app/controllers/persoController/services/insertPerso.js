const service = async (body, terminal, card, trx) => {

    console.log(`[*] Insert perso`)
    await Promise.all([
        trx('ecms.t_d_trx_perso').insert({
            c_login: body.c_login,
            i_card_type: body.i_card_type,
            i_issuer: card.i_issuer,
            c_uid: body.c_uid,
            c_card_number: body.c_card_number,
            n_card_security_code: card.n_card_security_code,
            c_card_version_code: card.c_card_version_code,
            c_pos: body.c_pos,
            c_station: terminal.c_station,
            n_station: terminal.n_station,
            c_reader: body.c_reader,
            c_status: "00",
            c_desc: "S",
            n_perso_by: body.n_perso,
            d_perso_at: body.d_perso_at
        }), 
        trx('ecms.t_m_card').update({
            i_perso_status: body.i_perso_status,
            n_perso: body.n_perso,
            d_perso: trx.raw('CURRENT_TIMESTAMP'),
            d_updated_at: trx.raw('CURRENT_TIMESTAMP'),
        })
        .where({
            c_card_number: body.c_card_number,
            c_uid: body.c_uid
        })]);

    return true

}

module.exports = service;