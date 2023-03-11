/* 
 ;==========================================
 ; Title    : Operational Middleware
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

const db = require('../config/database')
const moment = require('moment')
const winston = require('../helpers/winston.logger')
moment.locale('id');

const middleware = async (req, res, next) => {
    let result = {}
    const location = "OPERATIONAL MIDDLEWARE"
    try {

        const parameterSetting = await db('sot.t_m_setting').select([db.raw("TRIM(c_setting) AS c_setting, TRIM(e_setting) AS e_setting, TRIM(n_setting) AS n_setting")])
            .whereIn('c_setting', ['SO', 'EO', 'NO'])
            .where({
                b_active: true,
                d_end : null
            })

        if (parameterSetting.length != 3) {
            result = {
                status: '94',
                message: "Terminal sedang tidak beropresi !",
                data: {}
            }

            // log info
            winston.logger.warn(
                `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result)  
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
            result = {
                status: '95',
                message: "Sesi tidak valid, silahkan Melakukan openshift !",
                data: {}
            }

            // log info
            winston.logger.warn(
                `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result)  
        }

        let parameter = {}
        parameterSetting.forEach(item => {
            if(item.c_setting == 'SO') parameter = {...parameter, ...{SO: item.e_setting}};
            if(item.c_setting == 'EO') parameter = {...parameter, ...{EO: item.e_setting}};
            if(item.c_setting == 'NO') parameter = {...parameter, ...{NO: item.e_setting}};
        });
            
        const startOT = moment(isLoginBefore.d_login).format('YYYY-MM-DD') + ' ' + parameter.SO
        // end date operatrional +1day
        let endOT = ""
        if(parameter.NO.toUpperCase() == "TRUE"){
            endOT = moment(isLoginBefore.d_login).add(1, 'day').format('YYYY-MM-DD') + ' ' + parameter.EO
        }else{
            endOT = moment(isLoginBefore.d_login).format('YYYY-MM-DD') + ' ' + parameter.EO
        }

        const currentTime = moment()
        const server = await db.select([db.raw("TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') AS current_time")]).first()

        if(Math.abs(moment(server.current_time).diff(currentTime, 'second')) > 60){
            result = {
                status: '05',
                message: 'Waktu terminal dan server melebihi batas selisih !',
                data: {
                    server : server.current_time,
                    service: currentTime
                }
            }

            // log info
            winston.logger.warn(
                `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result)  
        }

        if (currentTime.isBefore(startOT)) {
            result = {
                status: '96',
                message: "Sesi tidak valid, Silahkan melakukan login ulang",
                data: {}
            }
            // log info
            winston.logger.warn(
                `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result)  
        }

        if (currentTime.isAfter(endOT)) {
            result = {
                status: '97',
                message: `Sesi melebihi batas waktu operasional ${endOT}, Silahkan melakukan closeshift !`,
                data: {}
            }

            // log info
            winston.logger.warn(
                `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result) 
        }

        let generate = await db.first(db.raw(`'REQ' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISSMS') as c_unique`))
        
        req.c_unique = generate.c_unique

        next();

    } catch (e) {
        
        result = { //500
            status: '99',
            message:  "Terjadi kesalahan system !",
            data: e.message
        }

        // log info
        winston.logger.error(
            `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)} ERROR : ${e.message}`
        );

        return res.status(200).send(result)
    }

}

module.exports = middleware;