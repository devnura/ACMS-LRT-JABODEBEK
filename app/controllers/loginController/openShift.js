require('dotenv').config()
const moment = require('moment')
moment.locale('id')
const {
    ACCESS_TOKEN_SECRET
} = require('../../config/secret')

const winston = require('../../helpers/winston.logger')

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
const checkForUserLogin = require('./services/checkForUserLogin').default
const { add } = require('nodemon/lib/rules')

const controller = async (req, res) => {
    let result = {}
    const location = "OPEN SHIFT"
    try {

        let {
            username,
            password,
            c_pos
        } = req.body || ""

        // Transaction begin
        await db.transaction(async trx => {
            
            // getting user
            // log debug
			winston.logger.debug(`${req.requestId} ${req.requestUrl} getting user...`);
            let user = await getUserByUsername(username, trx);
            // log debug
			winston.logger.debug(`${req.requestId} ${req.requestUrl} result user : ${user}`);
			
            if (!user) {
                result = {
                    status: "01",
                    message: "Invalid Username !",
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result)   
            }

            // checking password
            let matchPassword = await checkPassword(user, password);
            if (!matchPassword) {
                result = {
                    status: "02",
                    message: "Invalid Password !",
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result)  
            }

            if (!user.b_pos) {
                result = {
                    status: "03",
                    message: "Unauthorize to acces POS !",
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result)  
            }

            // getting terminal
            const terminal = await getTerminal(c_pos, trx)
            if (!terminal) {
                result = {
                    status: "04",
                    message: "Invalid terminal code !",
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result)  
            }

            let serverTime = moment(terminal.server_time)
            let terminalTime = moment(req.body.d_login_at)

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

            // get terminal status from t_d_login where c_pos = request
            const terminalStatus = await getTerminalStatus(c_pos, trx)
            if (terminalStatus && terminalStatus.n_username != user.n_username) {
                result = {
                    status: '05',
                    message: 'Terminal Masih digunakan oleh ' + terminalStatus.e_fullname,
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result) 
            }

            // check if user login on another devices
            const checkUser = await checkForUserLogin(req.body, trx)
            if (checkUser) {
                result = {
                    status: '06',
                    message: 'Silahkan melakukan closeshift di terminal ' + checkUser.c_pos,
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result) 
            }

            const openshift = await getOpenShift(req.body, user, terminal, trx)
            if (!openshift) {
                result = {
                    status: "07",
                    message: "Open Shift Failed !",
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result) 
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

            result = {
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
            }
            // log info
            winston.logger.info(
                `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result)  
        })

    } catch (e) {
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