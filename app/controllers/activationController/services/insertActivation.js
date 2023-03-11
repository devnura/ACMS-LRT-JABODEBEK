// const db = require('../../../config/database')
const winston = require('../../../helpers/winston.logger')

const service = async (body, terminal, n_user, c_login, trx, req) => {

    let i_perso_status = body.i_perso_status
    if (body.c_status == "00") {
        const perso = await trx('ecms.t_m_card')
            .first(trx.raw('COALESCE(i_perso_status, 0) AS i_perso_status')).where({
                c_uid: body.c_uid,
                c_card_number: body.c_card_number
            })
        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} result perso : ${perso}`);

	    if(!perso) return false

        if((i_perso_status == "1" && perso.i_perso_status != "1" ) || (i_perso_status == "0" && perso.i_perso_status == "0")){
            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} Updating master card`);
            const card = await trx('ecms.t_m_card').update({
                i_perso_status: '1',
                n_perso: n_user,
                d_perso: body.d_active_date
            }, ['i_perso_status', 'i_issuer', 'n_card_security_code', 'c_card_version_code' ]).where({
                c_uid: body.c_uid,
                c_card_number: body.c_card_number
            })
            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result card : ${JSON.stringify(card)}`);

            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} Updating card perso`);
            const t_d_trx_perso = await trx('ecms.t_d_trx_perso').insert({
                c_login: c_login,
                i_card_type: body.i_card_type,
                i_issuer: card[0].i_issuer,
                c_uid: body.c_uid,
                c_card_number: body.c_card_number,
                n_card_security_code: card[0].n_card_security_code,
                c_card_version_code: card[0].c_card_version_code,
                c_pos: body.c_pos,
                c_station: terminal.c_station,
                n_station: terminal.n_station,
                c_reader: body.c_reader,
                c_status: "00",
                n_perso_by: n_user,
                d_perso_at: body.d_active_date,
            })
            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result card perso : ${JSON.stringify(t_d_trx_perso)}`);
        }

        i_perso_status = 1
        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} Updating master card set already use true`);
        const usecard = await trx('ecms.t_m_card').update({
            b_already_used: true,
        }, ['i_perso_status', 'b_already_used']).where({
            c_uid: body.c_uid,
            c_card_number: body.c_card_number
        })
        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} result usecard : ${JSON.stringify(usecard)}`);

        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} Updating card owner detail`);
        const updateCardOwnerDetail = await trx('ecms.t_m_card_owner_detail')
            .update({
                c_uid: body.c_uid,
                c_card_number: body.c_card_number,
                d_active_date: body.d_active_date,
                d_expired_date: body.d_expired_date,
                i_card_active_time_in_days: body.i_card_active_time_in_days
            }, 'i_card_owner')
            .where({
                n_identity_number: body.n_identity_number,
                c_registration_code: body.c_registration_code
            })
        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} result card owner detail : ${JSON.stringify(updateCardOwnerDetail)}`);

        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} Updating card registration`);
        var updateCardRegistration = await trx('ecms.t_d_trx_card_registration')
            .update({
                c_uid: body.c_uid,
                c_card_number: body.c_card_number,
                n_activation: n_user,
                d_activation: body.d_active_date,
                c_pos: body.c_pos,
                c_station: body.c_station,
                n_station: terminal?.n_station || null,
                c_reader: body.c_reader
            }, 'i_id')
            .where({
                c_registration_code: body.c_registration_code,
                n_identity_number: body.n_identity_number
            })
            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result card registration : ${JSON.stringify(updateCardRegistration)}`);
    }

    // log debug
    winston.logger.debug(`${req.requestId} ${req.requestUrl} Updating card registration`);
    const card_registration = await trx('ecms.t_d_trx_card_registration')
            .first('i_id')
            .where({
                c_registration_code: body.c_registration_code
            })
    // log debug
    winston.logger.debug(`${req.requestId} ${req.requestUrl} result card registration : ${JSON.stringify(card_registration)}`);
    
    // log debug
    winston.logger.debug(`${req.requestId} ${req.requestUrl} Updating card registration history`);
    const t_d_trx_card_registration_history = await trx('ecms.t_d_trx_card_registration_history').insert({
            i_card_registration: card_registration.i_id,
            c_registration_code: body.c_registration_code,
            n_identity_number: body.n_identity_number,
            i_card_type: body.i_card_type,
            c_uid: body.c_uid,
            c_card_number: body.c_card_number,
            c_specific_station: body.c_specific_station != "" ? body.c_specific_station : null,
            i_card_active_time_in_days: body.i_card_active_time_in_days,
            d_registration: body.d_active_date,
            n_activation: n_user,
            d_activation: body.d_active_date,
            c_pos: body.c_pos,
            c_station: body.c_station,
            n_station: terminal?.n_station || null,
            d_active_date: body.d_active_date,
            d_expired_date: body.d_expired_date,
            c_reader: body.c_reader,
            c_status: body.c_status,
            c_login: body.c_login,
            n_activation: n_user
        }, 'c_status')
    // log debug
    winston.logger.debug(`${req.requestId} ${req.requestUrl} result card registration history : ${JSON.stringify(t_d_trx_card_registration_history)}`);
    
    if(body.c_status != "00") return false
    
    return true
}

module.exports = service;