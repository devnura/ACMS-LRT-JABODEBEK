// const db = require('../../../config/database')

const service = async (user, trx) => {

    console.log("[*] CLOSESHIFT...")
    // const trans = await db.transaction(async trx => {

    const isLoginBefore = await trx('ctm.t_d_login AS tdl')
        .first("tdl.c_login", "tdl.d_login")
        .where({
            "tdl.n_username": user.n_username,
            "tdl.c_login_before": null,
            "tdl.i_login_status": 1
        })
        .whereNotIn('tdl.c_login', trx.raw(`select
                c_login
            from
                ctm.t_d_logout tdl2
            where
                tdl2.n_username = '${user.n_username}'`))
        .orderBy('tdl.d_login', 'desc')

    return isLoginBefore

}



module.exports = service;