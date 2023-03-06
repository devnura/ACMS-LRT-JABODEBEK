const db = require('../config/database')
const moment = require('moment')

const middleware = async (req, res, next) => {

    try {
        console.log("[*] operational middleware", req.d_login)

        const parameterSetting = await db('sot.t_m_setting').select([db.raw("TRIM(c_setting) AS c_setting, TRIM(e_setting) AS e_setting, TRIM(n_setting) AS n_setting")])
            .whereIn('c_setting', ['SO', 'EO', 'NO'])
            .where({
                b_active: true,
                d_end : null
            })
            console.log("parameter setting : ", parameterSetting)
        if (parameterSetting.length != 3) {
            return res.status(200).send({
                status: '94',
                message: "Terminal sedang tidak beropresi !",
                data: {}
            })
        }

        const isLoginBefore = await db('ctm.t_d_login AS tdl')
            .first("tdl.c_login", "tdl.d_login")
            .where({
                "tdl.n_username": req.n_user,
                "tdl.c_login_before": null
            })
            .whereNotIn('tdl.c_login', db.raw(`select
                            c_login
                        from
                            ctm.t_d_logout tdl2
                        where
                        tdl2.n_username = '${req.n_user}'`))
            .orderBy('tdl.d_login', 'desc')

        if (!isLoginBefore) {
            return res.status(200).send({
                status: '95',
                message: "Belum melakukan openshift !",
                data: {}
            })
        }

        let parameter = {}
        parameterSetting.forEach(item => {
            if(item.c_setting == 'SO') parameter = {...parameter, ...{SO: item.e_setting}};
            if(item.c_setting == 'EO') parameter = {...parameter, ...{EO: item.e_setting}};
            if(item.c_setting == 'NO') parameter = {...parameter, ...{NO: item.e_setting}};
        });
        console.log("Ini : ",parameter)
            
        const startOT = moment(isLoginBefore.d_login).format('YYYY-MM-DD') + ' ' + parameter.SO
        // end date operatrional +1day
        let endOT = ""
        if(parameter.NO.toUpperCase() == "TRUE"){
            console.log("[*] Overningt : true");
            endOT = moment(isLoginBefore.d_login).add(1, 'day').format('YYYY-MM-DD') + ' ' + parameter.EO
        }else{
            console.log("[*] Overningt : false");
            endOT = moment(isLoginBefore.d_login).format('YYYY-MM-DD') + ' ' + parameter.EO
        }
        console.log("10 : ",startOT, endOT)

        const currentTime = moment()

        if (currentTime.isBefore(startOT)) {
            return res.status(200).send({
                status: '96',
                message: "Sesi tidak valid, Silahkan melakukan login ulang",
                data: {}
            })
        }

        if (currentTime.isAfter(endOT)) {
            return res.status(200).send({
                status: '97',
                message: "Silahkan melakukan closeshift !",
                data: {}
            })
        }

        let generate = await db('ecms.t_m_request_code').first(db.raw(`'REQ' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISSMS') as c_unique`))
        req.c_unique = generate.c_unique
        next();
    } catch (e) {
        console.error("[x] message : ", e.message)
        return res.status(200).send({ //500
            status: '99',
            message: "Terjadi Kesalahan System !",
            data: {}
        })
    }


}

module.exports = middleware;