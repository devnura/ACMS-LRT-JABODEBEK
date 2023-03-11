const service = async (body, trx) => {

    let rows = await trx.first(trx.raw('TRIM(c_pos) AS c_pos')).from('ctm.t_d_login AS tdl').where({
        "tdl.n_username": body.username,
        "tdl.c_login_before": null,
        "tdl.i_login_status": 1
    })
    .whereNot({
        "tdl.c_pos": body.c_pos
    })
    .whereNotIn('tdl.c_login', trx.raw(`SELECT
                tdl2.c_login
            FROM
                ctm.t_d_logout tdl2
            `))

    if (!rows) return false

    return rows
}

export default service;