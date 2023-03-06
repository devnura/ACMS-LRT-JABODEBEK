// const db = require('../../../config/database')

const service = async (c_pos, trx) => {
    console.log("[*] Getting terminal status : ")

    const rows = await trx.first(
            "tdl.i_id",
            "tdl.e_fullname",
            "tdl.n_username"
        )
        .from("ctm.t_d_login AS tdl")
        .where({
            "tdl.c_pos": c_pos,
            "tdl.c_login_before" : null,
            "tdl.i_login_status" : "1",
        })

    if(rows)console.log("[*] RESULT TERMINAL : ", rows)

    return rows
}

module.exports = service;