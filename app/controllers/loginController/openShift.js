require('dotenv').config()
const moment = require('moment')
const {
    ACCESS_TOKEN_SECRET
} = require('../../config/secret')

const {
    validationResult
} = require('express-validator')

/*
    Config
 */
const jwt = require('jsonwebtoken')
const db = require('../../config/database')

/*
    Services
 */
const getUserByUsername = require('./services/getUserByUsername')
const checkPassword = require('./services/checkPassword')
const getAddStock = require('./services/getAddStock')
const getSetting = require('./services/getSetting')
const getTerminal = require("./services/getTerminal")
const getOpenShift = require("./services/openShift")
const getTerminalStatus = require('./services/getTerminalStatus')
const checkForUserLogin = require('./services/checkForUserLogin')
const { add } = require('nodemon/lib/rules')

const controller = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(200).send({
            status: '98',
            message: errors.array()[0].msg,
            data: {}
        }); //422

        let {
            username,
            password,
            c_pos
        } = req.body || ""

        // Transaction begin
        await db.transaction(async trx => {
            
            // getting user
            let user = await getUserByUsername(username, trx);
            if (!user) {
                return res.status(200).send({
                    status: "01",
                    message: "Invalid Username !",
                    data: {}
                })
            }

            // checking password
            let matchPassword = await checkPassword(user, password);
            if (!matchPassword) {
                return res.status(200).send({
                    status: "02",
                    message: "Invalid Password !",
                    data: {}
                })
            }

            if (!user.b_pos) {
                return res.status(200).send({
                    status: "03",
                    message: "Unauthorize to acces POS !",
                    data: {}
                })
            }

            // getting terminal
            const terminal = await getTerminal(c_pos, trx)
            if (!terminal) {
                return res.status(200).send({
                    status: "04",
                    message: "Invalid terminal code !",
                    data: {}
                })
            }

            // check time
            // let start = moment(terminal.server_time).subtract(60, 's').format("YYYY-MM-DD HH:mm:ss")
            // let end = moment(terminal.server_time).add(60, 's').format("YYYY-MM-DD HH:mm:ss")

            // if (!moment(req.body.d_login_at).isBetween(start, end)) {
            //     return res.status(200).send({
            //         status: '05',
            //         message: 'Waktu terminal dan server melebihi batas selisih !',
            //         data: {}
            //     })
            // }

            let serverTime = moment(terminal.server_time)
            let terminalTime = moment(req.body.d_login_at)

            if (Math.abs(serverTime.diff(terminalTime, 's')) > 60) {
                return res.status(200).send({
                    status: '05',
                    message: 'Waktu terminal dan server melebihi batas selisih !',
                    data: {}
                })
            }

            // get terminal status from t_d_login where c_pos = request
            const terminalStatus = await getTerminalStatus(c_pos, trx)
            if (terminalStatus && terminalStatus.n_username != user.n_username) {
                return res.status(200).send({
                    status: '05',
                    message: 'Terminal Masih digunakan oleh ' + terminalStatus.e_fullname,
                    data: {}
                })
            }

            // check if user login on another devices
            const checkUser = await checkForUserLogin(req.body, trx)
            if (checkUser) {
                return res.status(200).send({
                    status: '06',
                    message: 'Silahkan melakukan closeshift di terminal ' + checkUser.c_pos,
                    data: {}
                })
            }

            const openshift = await getOpenShift(req.body, user, terminal, trx)
            if (!openshift) {
                return res.status(200).send({
                    status: "07",
                    message: "Open Shift Failed !",
                    data: {}
                })
            }  
            
            const d_login = moment(openshift.d_login).format('YYYY-MM-DD')
            
            const addStock = await getAddStock(openshift.c_login, trx)

            let token = jwt.sign({
                c_login: openshift.c_login,
                d_login: d_login,
                n_user: user.n_username,
                c_pos: c_pos
            }, ACCESS_TOKEN_SECRET, {
                expiresIn: '24h'
            });

            const setting = await getSetting('ECMS02', trx)

            return res.status(200).send({
                status: "00",
                message: "Success",
                data: {
                    e_fullname: user.e_fullname || "",
                    n_username: user.n_username || "",
                    c_login: openshift.c_login || "",
                    d_login:  d_login || "",
                    n_group: user.n_group || "",
                    // c_loket: terminal.c_loket || "",
                    c_pos: terminal.c_pos || "",
                    c_station: terminal.c_station || "",
                    n_station: terminal.n_station || "",
                    i_time_out: setting?.e_setting || "",
                    addstock: addStock,
                    token
                }
            })
        })

    } catch (e) {
        console.error("[x] message : ", e.message)
        return res.status(200).send({ //500
            status: '99',
            message: e.message,
            data: {}
        })
    }
}

module.exports = controller;