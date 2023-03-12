/* 
 ;==========================================
 ; Title    : Logout
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

const moment = require('moment')
moment.locale("id")
/*
    Config
 */
const db = require('../../config/database')
const winston = require('../../helpers/winston.logger')

/*
    Services
*/
const closeShift = require('./services/closeShift')
const checkPassword = require('./services/checkPassword')
const getUserByUsername = require('./services/getUserByUsername')
const checkLoginBefore = require('./services/checkLoginBefore')
const getTerminal = require('./services/getTerminal')

const controller = async (req, res) => {
    let result = {}
	const location = "LOG OUT"
    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {

            const user = await getUserByUsername(body.username, trx)
            if(!user) {
                result = {
                    status: "02",
                    message: "Invalid Username/Password !",
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            const password = await checkPassword(user, body.password)
            if(!password){
                result = {
                    status: "02",
                    message: "Invalid Username/Password !",
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            const terminal = await getTerminal(body.c_pos, trx)
            if(!terminal){
                result = {
                    status: "03",
                    message: "Invalid Terminal Code !",
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            const loginBefore = await checkLoginBefore(user, trx)
            if (!loginBefore) {
                result = {
                    status: "04",
                    message: "Belum Melakukan Openshift !",
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }
            // check time
            
            let serverTime = moment(terminal.server_time)
            let terminalTime = moment(body.d_logout_at)

            if (Math.abs(serverTime.diff(terminalTime, 's')) > 60) {
                result = {
                    status: '05',
                    message: 'Waktu terminal dan server melebihi batas selisih !',
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }
            
            let closeshift = await closeShift(req.c_login, body.d_logout_at, terminal, user, trx);
            if (!closeshift) {
                result = {
                    status: "01",
                    message: "Failed",
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            result = {
                status: "00",
                message: "Success",
                data: {}
            }
            // log info
            winston.logger.info(
                `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result)
        })

    } catch (e) {
        console.error("[x] message : ", e.message)
        
        result = { //500
            status: '99',
            message:  "Terjadi kesalahan system !",
            data: {}
        }

        // log info
        winston.logger.error(
            `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)} ERROR : ${e.message}`
        );

        return res.status(200).send(result)
    }
}

module.exports = controller;