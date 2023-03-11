/*
Config
*/
const db = require('../../config/database')
const winston = require('../../helpers/winston.logger')
/*
    Services
*/
const getLoginInfo = require('./services/getLoginInfo')

const controller = async (req, res) => {
    let result = {}
    const location = "LOGIN INFO"
    try {

        let {
            body
        } = req || ""
        
        await db.transaction(async trx => {
            const loginInfo = await getLoginInfo(body, trx)
            if (!loginInfo) {
                result = {
                    status: '01',
                    message: 'Invalid code login!',
                    data: {}
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result)  
            }

            result = {
                status: '00',
                message: 'success',
                data: loginInfo
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