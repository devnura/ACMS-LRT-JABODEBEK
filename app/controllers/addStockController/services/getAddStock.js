const service = async (c_login, trx) => {
    const rows = await trx.count("*")
        .from("ctm.t_d_addstock AS tda")
        .where({
            "tda.c_login": c_login
        })
    if(rows[0].count > 0) return false 
    return true
}

module.exports = service;