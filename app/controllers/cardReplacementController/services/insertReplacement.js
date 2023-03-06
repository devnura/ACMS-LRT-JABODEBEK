const service = async (body, trx) => {

    console.log(`[*] Inserting Replacement..`)
    
    const terminal = await trx('ecms.t_m_card').first(
        "tmp.i_id",
        trx.raw("TRIM(tmp.c_pos) as c_pos"),
        trx.raw("TRIM(tmp.c_station) as c_station"),
        trx.raw("TRIM(tmp.e_ip_address) as e_ip_address"),
        "tms.n_station"
    )
    .from("dms.t_m_pos AS tmp")
    .leftJoin('opr.t_m_station AS tms', function () {
        this.on('tms.c_station', '=', 'tmp.c_station')
    })
    .where({
        "tmp.c_pos": body.c_pos
    })

    if (body.c_status == "00") {
        
        let i_perso_status = body.i_perso_status

        const perso = await trx('ecms.t_m_card').first(trx.raw('COALESCE(i_perso_status, 0) AS i_perso_status')).where({
            c_uid: body.c_uid,
            c_card_number: body.c_card_number
        })

        if((i_perso_status == "1" && perso.i_perso_status != "1" ) || (i_perso_status == "0" && perso.i_perso_status == "0")){
            // ==================================================================================
            //    PERSO 
            // ================================================================================== 

            console.log("[trx] running transaction t_d_trx_perso...")

            const card = await trx('ecms.t_m_card').update({
                i_perso_status: '1',
                b_already_used: true,
                n_perso: body.n_card_replacement,
                d_perso: body.d_card_replacement
            }, ['i_perso_status', 'i_issuer', 'n_card_security_code', 'c_card_version_code', ]).where({
                c_uid: body.c_uid,
                c_card_number: body.c_card_number
            })

            await trx('ecms.t_d_trx_perso').insert({

                c_login: body.c_login,
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
                c_desc: "S",
                n_perso_by: body.n_card_replacement,
                d_perso_at: body.d_active_date,
            })

        }
        
        i_perso_status = 1
        
        // ==================================================================================
        //    BLACKLIST 
        // ================================================================================== 

        let trx_blacklist = await trx('ecms.t_d_trx_blacklist').insert({
            "n_identity_number" : body.n_identity_number,
            "i_card_type" : body.i_card_type,
            "c_uid" : body.c_uid_old,
            "c_card_number" : body.c_card_number_old,
            "b_blacklist_card" : true,
            "b_blacklist_owner" : true,
            "i_blacklist_status" : 2,
            "n_blacklist" : body.n_card_replacement,
            "d_blacklist" : trx.raw("NOW()"),
            "n_created_by" : body.n_card_replacement
        }, ["i_id"])
        if (trx_blacklist) console.log("[trx] Transaction to trx_blacklist : Success")
         
        await trx('ecms.t_d_trx_blacklist_history').insert({
            "i_blacklist" : trx_blacklist[0].i_id,
            "n_identity_number" : body.n_identity_number,
            "i_card_type" : body.i_card_type,
            "c_uid" : body.c_uid_old,
            "c_card_number" : body.c_card_number_old,
            "b_blacklist_card" : true,
            "b_blacklist_owner" : true,
            "i_blacklist_status" : 2,
            "n_blacklist" : body.n_card_replacement,
            "d_blacklist" : trx.raw("NOW()"),
        })

        // ==================================================================================
        //    CARD
        // ================================================================================== 

        console.log("[trx] running transaction t_m_card...")

        await trx('ecms.t_m_card').update({
                b_active: false,
                i_blacklist_status: 2
            })
            .where({
                c_uid: body.c_uid_old,
                c_card_number: body.c_card_number_old
            })
        
        await trx('ecms.t_m_card').update({
                b_already_used: true
            })
            .where({
                c_uid: body.c_uid,
                c_card_number: body.c_card_number
            })

        // ==================================================================================
        //    CARD OWNER
        // ================================================================================== 

        console.log("[trx] running transaction t_m_card_owner_detail...")

        let old_t_m_card_owner_detail = await trx('ecms.t_m_card_owner_detail').update({
            b_active: false
        }, ['i_card_owner', 'i_card_type', 'n_identity_number']).where({
            n_identity_number: body.n_identity_number,
            c_registration_code: body.c_registration_code,
            c_uid: body.c_uid_old,
            c_card_number: body.c_card_number_old
        })

        await trx('ecms.t_m_card_owner_detail').insert({
            i_card_owner: old_t_m_card_owner_detail[0].i_card_owner,
            n_identity_number: old_t_m_card_owner_detail[0].n_identity_number,
            i_card_type: old_t_m_card_owner_detail[0].i_card_type,
            c_uid: body.c_uid,
            c_card_number: body.c_card_number,
            c_specific_station: body.c_specific_station != "" ? body.c_specific_station : null,
            i_card_active_time_in_days: body.i_card_active_time_in_days,
            c_registration_code: body.c_registration_code,
            d_registration: body.d_card_replacement,
            d_active_date: body.d_active_date,
            d_expired_date: body.d_expired_date,
        })

    }

    // ==================================================================================
    //    CARD REPLACEMENT TRANSACTION
    // ================================================================================== 

    const getNote = await trx('ecms.t_m_card_replacement_note').first('n_card_replacement_note').where({
        i_id: body.i_card_replacement_note
    })

    const t_d_trx_card_replacement = await trx('ecms.t_d_trx_card_replacement').insert({
        c_registration_code: body.c_registration_code,
        n_identity_number: body.n_identity_number,
        i_card_type: body.i_card_type,
        c_uid: body.c_uid,
        c_card_number: body.c_card_number,
        c_uid_old: body.c_uid_old,
        c_card_number_old: body.c_card_number_old,
        c_specific_station: body.c_specific_station != "" ? body.c_specific_station : null,
        i_card_active_time_in_days: body.i_card_active_time_in_days,
        d_active_date: body.d_active_date,
        d_expired_date: body.d_expired_date,
        n_card_replacement: body.n_card_replacement,
        d_card_replacement: body.d_card_replacement,
        c_pos: body.c_pos,
        c_station: body.c_station,
        n_station: terminal.n_station || null,
        c_reader: body.c_reader,
        c_desc:  body.c_status == "00" ? "S" : "F",
        i_card_replacement_note: body.i_card_replacement_note,
        n_note: getNote.n_card_replacement_note,
        c_status: body.c_status,
        c_login: body.c_login,
    })

    return true
}

module.exports = service;