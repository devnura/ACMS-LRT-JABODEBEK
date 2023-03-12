/* 
 ;==========================================
 ; Title    : Card Replacemenet
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

/*
    Config
 */
const db = require('../../config/database')
const winston = require('../../helpers/winston.logger')
/*
        Services
*/
const insertReplacement = require('./services/insertReplacement')
const getMessage = require('./services/getMessage')

const controller = async (req, res) => {
    let result = {}
	const location = "ACTIVATION VALIDATE"
    try {

        let { body } = req 

        await db.transaction(async trx => {

            await trx('ecms.t_m_request_code').insert({c_request_code: body.c_unique})
            
            const replacement = await insertReplacement(body, trx)
            if (!replacement || body.c_status != "00") {
                const message = await getMessage('0', 'CARD REPLACEMENT', '01', trx)
                result = {
                    status: message?.c_status || '01',
                    message: message?.n_desc || 'Proses replacement gagal !',
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            const message = await getMessage('0', 'CARD REPLACEMENT', '00', trx)
            result = {
                status: message?.c_status || "00",
                message: message?.n_desc || "SUKSES",
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