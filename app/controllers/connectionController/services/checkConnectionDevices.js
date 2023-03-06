const db = require('../../../config/database')

const service = async (c_pos) => {
    console.log("[*] GETTING TERMINAL : ")

    const rows = await db.first(
            "tmp.n_station"
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