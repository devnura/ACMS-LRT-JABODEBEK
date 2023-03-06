// const db = require('../../../config/database')

const service = async (c_pos, trx) => {
    console.log("[*] GETTING TERMINAL : ")

    const rows = await trx.first(
            "tmp.i_id",
            trx.raw("TRIM(tmp.c_pos) as c_pos"),
            trx.raw("TRIM(tmp.c_station) as c_station"),
            trx.raw("TRIM(tmp.e_ip_address) as e_ip_address"),
            trx.raw("TRIM(tmp.c_station) as c_station"),
            "tms.n_station"
        )
        .from("dms.t_m_pos AS tmp")
        .leftJoin('opr.t_m_station AS tms', function () {
            this.on('tms.c_station', '=', 'tmp.c_station')
        })
        .where({
            "tmp.c_pos": c_pos
        })

    if(rows)console.log("[*] RESULT TERMINAL : ", rows)

    return rows
}

module.exports = service;