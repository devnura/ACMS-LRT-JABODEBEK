const {
    validationResult
} = require('express-validator')
const moment = require('moment')

/*
    Config
 */
const db = require('../../config/database')

/*
    Services
*/
const closeShift = require('./services/closeShift')
const checkPassword = require('./services/checkPassword')
const getUserByUsername = require('./services/getUserByUsername')
const checkLoginBefore = require('./services/checkLoginBefore')
const getTerminal = require('./services/getTerminal')

const controller = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(200).send({
        status: '98',
        message: errors.array()[0].msg,
        data: {}
    }); //422

    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {

            const user = await getUserByUsername(body.username, trx)
            if(!user) {
                return res.status(200).send({
                    status: "02",
                    message: "Invalid Username/Password !",
                    data: {}
                })
            }

            const password = await checkPassword(user, body.password)
            console.log("password: ", password)
            if(!password){
                return res.status(200).send({
                    status: "02",
                    message: "Invalid Username/Password !",
                    data: {}
                })
            }

            const terminal = await getTerminal(body.c_pos, trx)
            if(!terminal){
                return res.status(200).send({
                    status: "03",
                    message: "Invalid Terminal Code !",
                    data: {}
                })
            }

            const loginBefore = await checkLoginBefore(user, trx)
            if (!loginBefore) {
                return res.status(200).send({
                    status: "04",
                    message: "Belum Melakukan Openshift !",
                    data: {}
                })
            }
            // check time
            
            let serverTime = moment(terminal.server_time)
            let terminalTime = moment(body.d_logout_at)

            if (Math.abs(serverTime.diff(terminalTime, 's')) > 60) {
                return res.status(200).send({
                    status: '05',
                    message: 'Waktu terminal dan server melebihi batas selisih !',
                    data: {}
                })
            }
            
            let closeshift = await closeShift(req.c_login, body.d_logout_at, terminal, user, trx);
            if (!closeshift) {
                return res.status(200).send({
                    status: "01",
                    message: "Failed",
                    data: {}
                })
            }

            return res.status(200).send({
                status: "00",
                message: "Success",
                data: {}
            })
        })

    } catch (e) {
        console.error("[x] message : ", e.message)
        return res.status(200).send({ //500
            status: '99',
            message: "Terjadi Kesalahan System !",
            data: {}
        })
    }
}

module.exports = controller;