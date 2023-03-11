// const db = require('../../../config/database')

const service = async (c_pos, trx) => {
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

    return rows
}

module.exports = service;