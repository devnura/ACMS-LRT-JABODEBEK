/* 
 ;==========================================
 ; Title    : Activation
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
const insertActivation = require('./services/insertActivation')
const getTerminal = require('./services/getTerminal')
const getMessage = require('./services/getMessage')
const validateRequestCode = require('./services/validateRequestCode')

const controller = async (req, res) => {
    let result = {}
	const location = "ACTIVATION"
    try {

        let {
            body
        } = req || ""
        // Jika c_status dari depan != 00 maka kartu gagal di aktivasi 
        await db.transaction(async trx => {

            const terminal = await getTerminal(body.c_pos, trx)
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result terminal : ${terminal}`);
            if(!terminal){
                result = {
                    status: '01',
                    message: 'TERMINAL TIDAK DITEMUKAN !',
                    data: {
                        'c_uid': body.c_uid || '',
                        "c_card_number": body.c_card_number || '',
                        "i_perso_status": body.i_perso_status || '',
                        "c_status": body.c_status || ''
                    }
                }

                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
                 
            }

            const validaterequest = await validateRequestCode(body, trx)
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result validaterequest : ${validaterequest}`);
            if(validaterequest){
                result = {
                    status: '01',
                    message: 'SILAHKAN LAKUKAN VALIDASI ULANG !',
                    data: {
                        'c_uid': body.c_uid || '',
                        "c_card_number": body.c_card_number || '',
                        "i_perso_status": body.i_perso_status || '',
                        "c_status": body.c_status || ''
                    }
                }

                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result) 
            }

            const activation = await insertActivation(body, terminal, req.n_user, req.c_login, trx, req)
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result activation : ${activation}`);
            if (!activation) {
                const message = await getMessage(body.i_card_type, 'CARD ACTIVATION', '01', trx)

                result = {
                    status: message?.c_status || '01',
                    message: message?.n_desc || 'KARTU GAGAL DIAKTIVASI !',
                    data: {
                        'c_uid': body.c_uid || '',
                        "c_card_number": body.c_card_number || '',
                        "i_perso_status": body.i_perso_status || '',
                        "c_status": body.c_status || ''
                    }
                }
                // log info
				winston.logger.warn(
					`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result)  
            }
            // sukses
            const message = await getMessage(body.i_card_type, 'CARD ACTIVATION', "00", trx)
            result = {
                status: message.c_status || body.c_status,
                message: message.n_desc || 'Sukses',
                data: {
                    'c_uid': body.c_uid,
                    "c_card_number": body.c_card_number,
                    "i_perso_status": '1',
                    "c_status": body.c_status
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