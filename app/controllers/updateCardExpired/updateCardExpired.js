/*
    Config
 */
const db = require('../../config/database')
const helper = require('../../helpers/helper')
const winston = require('../../helpers/winston.logger')
/*
    Services
*/
const updateCardExpired = require('./services/updateCardExpired')
const getMessage = require('./services/getMessage')

const controller = async (req, res) => {
    let result = {}
    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {

            await trx('ecms.t_m_request_code').insert({c_request_code: body.c_unique})
            
            const updatecardexpired = await updateCardExpired(body, trx)
            if (!updatecardexpired) {
                const message = await getMessage("0", 'UPDATE CARD EXPIRED', '01', trx)
                
                result = {
                    status: message.c_status || '01',
                    message: message.n_desc || 'Proses Update Kartu Gagal !',
                    data: {}
                }

                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)        

            }

            const message = await getMessage("0", 'UPDATE CARD EXPIRED', '00', trx)
             result = {
                 status: message.c_status || '00',
                 message: message.n_desc || 'Sukses',
                 data: {}
             }

            // log info
            winston.logger.info(
                `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
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
        winston.logger.info(
            `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)} ERROR : ${e.message}`
        );

        return res.status(200).send(result)
    }
}

module.exports = controller;