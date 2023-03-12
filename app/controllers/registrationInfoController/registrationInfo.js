/* 
 ;==========================================
 ; Title    : Registration info
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

/*
    Config
 */
const db = require('../../config/database')
const winston = require("../../helpers/winston.logger");

/*
    Services
*/
const getRegistration = require('./services/getRegistration')
const getMessage = require('./services/getMessage')

const controller = async (req, res) => {
    let result = {}
	const location = "REGISTRATIONN INFO"
    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {

            const registration = await getRegistration(body, trx)
            if (!registration) {
                const message = await getMessage('0', 'CARD REGISTRATION', '01', trx)

                result = {
                    status: message?.c_status || '01',
                    message: message?.n_desc || 'KODE REGISTRASI TIDAK TERDAFTAR !',
                    data: {}
                }

                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (!registration.b_active) {
                const message = await getMessage('0', 'CARD REGISTRATION', '02', trx)

                result = {
                    status: message?.c_status || '01',
                    message: message?.n_desc || 'KODE REGISTRASI TIDAK AKTIF !',
                    data: {}
                }

                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            // sukses
            const message = await getMessage('0', 'CARD REGISTRATION', "00", trx)
            result = {
                status: message.c_status || body.c_status,
                message: message.n_desc || 'SUKSES',
                data: {
                    n_identity_number:registration?.n_identity_number || "",
                    n_fullname:registration?.n_fullname  || "",
                    c_registration_code:registration?.c_registration_code  || "",
                    c_card_number:registration?.c_card_number || "",
                    c_specific_station:registration?.c_specific_station  || "",
                    n_specific_station:registration?.n_specific_station  || "",
                    n_company_name:registration?.n_company_name  || "",
                    i_card_type:registration?.i_card_type || "",
                    n_card_type:registration?.n_card_type || "",
                    b_active:registration?.b_active  || "",
                }
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