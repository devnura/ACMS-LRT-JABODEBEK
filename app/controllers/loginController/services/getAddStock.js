const service = async (c_login, trx) => {
    console.log("[*] GETTING ADDSTOCK : ")

    const rows = await trx.count("*")
        .from("ctm.t_d_addstock AS tda")
        .where({
            "tda.c_login": c_login
        })
        console.log("Result Addstock :", rows)
    if(rows[0].count > 0) return false 
    return true
}

module.exports = service;