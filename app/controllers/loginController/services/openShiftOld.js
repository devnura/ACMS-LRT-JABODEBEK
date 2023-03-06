// const db = require('../../../config/database')
const moment = require('moment')
const service = async (user, terminal, trx) => {

    console.log("[*] OPENSHIFT...")
    const device_type = "2"
    // const trans = await db.transaction(async trx => {
 
        const isLoginBefore = await trx('ctm.t_d_login AS tdl')
        .first("tdl.c_login", "tdl.d_login") 
        .where({
            "tdl.c_pos" : terminal.c_pos,
            "tdl.c_login_before" : null,
            "tdl.n_username" : user.n_username
        })
        .whereNotIn('tdl.c_login', trx.raw(`SELECT
                c_login
            FROM
                ctm.t_d_logout tdl2
            `))
        .orderBy('tdl.d_login', 'desc')

        // jika ada 
        if(isLoginBefore) {
            // using existing c_login
              console.log("[*] USE EXISTING c_login")

              let _login = await trx("ctm.t_d_login").insert({
                  "c_login": isLoginBefore.c_login,
                  "c_login_before": isLoginBefore.c_login,
                  "c_station": terminal.c_station,
                  "n_station": terminal.n_station,
                  "c_pos": terminal.c_pos,
                  "i_login_type": device_type,
                  "n_username": user.n_username,
                  "e_fullname": user.e_fullname,
                  // "m_lsam" : body.m_lsam,
                  // "c_lsam" : body.c_lsam,
                  // "c_psam" : body.c_psam,
                  // "c_lsam_felica" : body.c_lsam_felica,
                  // "m_lsam_felica" : body.m_lsam_felica,
                  "i_login_status": 2,
                  "c_status": "00",
                  "c_desc": "S",
              }, ["c_login", "d_login"])
  
              return _login[0]

        }else {
            console.log("[*] GENERATE NEW c_login")
            // let prefix = 'STL'+moment.format('YYYYMMDD')+terminal.c_pos
            
            // let gen = await trx.count('i_id').from('ctm.t_d_login')
            let generate = await trx.first(trx.raw(`'STL' || to_char(current_Date, 'YYYYMMDD') || '${terminal.c_pos}' || to_char((coalesce(COUNT(i_id), 0) + 1), 'fm000') as c_login`))
                .from('ctm.t_d_login')
                .where({
                    "c_pos": terminal.c_pos,
                    "c_login_before": null
                })

            let _login = await trx("ctm.t_d_login").insert({
                "c_login": generate.c_login,
                "c_station": terminal.c_station,
                "n_station": terminal.n_station,
                "c_pos": terminal.c_pos,
                "i_login_type": device_type,
                "i_login_status": 1,
                "n_username": user.n_username,
                "e_fullname": user.e_fullname,
                // "m_lsam" : body.m_lsam,
                // "c_lsam" : body.c_lsam,
                // "c_psam" : body.c_psam,
                // "c_lsam_felica" : body.c_lsam_felica,
                // "m_lsam_felica" : body.m_lsam_felica,
                "c_status": "00",
                "c_desc": "S",
            }, ["c_login", "d_login"])

            return _login[0]

        }
}

module.exports = service;                                                                                                                                                                                                                                                                                   