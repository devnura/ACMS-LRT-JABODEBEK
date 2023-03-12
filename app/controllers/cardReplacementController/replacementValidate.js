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
const getMasterCard = require('./services/getMasterCard')
const moment = require('moment')
const getMessage = require('./services/getMessage')
const getCardOwner = require('./services/getCardOwner')
moment.locale("id")

const controller = async (req, res) => {
    let result = {}
	const location = "REPLACEMENT VALIDATE"
    try {

        let {
            body
        } = req
        let masterCard = {}
        let cardOwner = {}
        let data = {
            c_unique: req.c_unique,
            identity: {},
            old_card: {},
            new_card: {},
        }

        await db.transaction(async trx => {

            // get master card if body.c_uid is not null
            if (body.c_uid) {
                masterCard = await getMasterCard(body.c_uid, trx)
                if (masterCard) {
                    data.new_card = {
                        i_card_type: masterCard.i_card_type || "",
                        n_card_type: masterCard.n_card_type || "",
                        c_uid: masterCard.c_uid || "",
                        c_card_number: masterCard.c_card_number || "",
                        c_specific_station: "",
                        c_specific_station_name: "",
                        d_active_date: "",
                        d_expired_date: "",
                        i_perso_status: masterCard.i_perso_status,
                        i_card_active_time_in_days: ""
                    }
                }
            }


            // get card registration if body.c_registration_code is not null
            if (body.c_registration_code) {

                cardOwner = await getCardOwner(body.c_registration_code, trx)
                if (cardOwner) {
                    data.identity = {
                        n_identity_number: cardOwner.n_identity_number || "",
                        n_fullname: cardOwner.n_fullname || "",
                        n_company_name: cardOwner.n_company_name || "",
                        c_registration_code: cardOwner.c_registration_code || "",
                        d_replacement_at: cardOwner.d_replacement_at || "",
                    }

                    // orang
                    if (cardOwner.c_uid == null) {
                        const message = await getMessage('0', 'CARD REPLACEMENT', '02', trx)
                        return res.status(200).send({
                            status: message?.c_status || '02',
                            message: message?.n_desc || 'Employee/Tenant tidak memiliki kartu sebelumnya. Silakan melakukan registrasi activasi kartu !',
                            data: data
                        })
                    }


                    if (body.c_uid && masterCard) {
                        data.new_card = {
                            ...data.new_card,
                            ...{
                                c_specific_station: cardOwner?.c_specific_station || "",
                                c_specific_station_name: cardOwner?.c_specific_station_name || "",
                                d_active_date: cardOwner?.d_active_date ? moment(cardOwner?.d_active_date).format("YYYY-MM-DD") : "",
                                d_expired_date: cardOwner?.d_expired_date ? moment(cardOwner?.d_expired_date).format("YYYY-MM-DD") : "",
                                i_card_active_time_in_days: cardOwner?.i_card_active_time_in_days.toString()
                            }
                        }
                    }

                    data.old_card = {
                        i_card_type: cardOwner?.i_card_type || "",
                        n_card_type: cardOwner?.n_card_type || "",
                        c_uid: cardOwner?.c_uid || "",
                        c_card_number: cardOwner?.c_card_number || "",
                        c_specific_station: cardOwner?.c_specific_station || "",
                        c_specific_station_name: cardOwner?.c_specific_station_name || "",
                        d_registration: cardOwner.d_registration ? moment(cardOwner.d_registration).format("YYYY-MM-DD") : "",
                        d_expired_date: cardOwner.d_expired_date ? moment(cardOwner.d_expired_date).format("YYYY-MM-DD") : "",
                    }

                }

            }

            if (!cardOwner) {
                const message = await getMessage('0', 'CARD REPLACEMENT', '07', trx)
                result = {
                    status: message?.c_status || "07",
                    message: message?.n_desc || "Data employee/tenant tidak ditemukan",
                    data: data
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            // kartu
            if (!masterCard) {
                const message = await getMessage('0', 'CARD REPLACEMENT', '03', trx)
                result = {
                    status: message?.c_status || '03',
                    message: message?.n_desc || "Data kartu baru tidak ditemukan",
                    data: data
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (masterCard.i_card_type != cardOwner.i_card_type) {
                
                const message = await getMessage('0', 'CARD REPLACEMENT', '04', trx)
                result = {
                    status: message?.c_status || '04',
                    message: "Tipe kartu tidak sesuai",
                    data: data
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (masterCard.b_already_used) {
                const message = await getMessage('0', 'CARD REPLACEMENT', '05', trx)
                result = {
                    status: message?.c_status || '05',
                    message: message?.n_desc || "Kartu sudah digunakan",
                    data: data
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (masterCard.i_blacklist_status) {

                const message = await getMessage('0', 'CARD REPLACEMENT', '06', trx)
                result = {
                    status: message?.c_status || "06",
                    message: message?.n_desc || "Kartu terkena blacklist",
                    data: data
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            // orangnya

            if (!cardOwner.b_active) {
                const message = await getMessage('0', 'CARD REPLACEMENT', '08', trx)
                result = {
                    status: message?.c_status || "08",
                    message: message?.n_desc || "Data employee/tenant sudah tidak aktif",
                    data: data
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            const message = await getMessage('0', 'CARD REPLACEMENT', '00', trx)
            result = {
                status:  message?.c_status || "00",
                message: message?.n_desc || "Sukses",
                data: data
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