/* 
 ;==========================================
 ; Title    : Activation Validate
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

/*
    Config
 */
const db = require('../../config/database')

const moment = require('moment')
moment.locale("id")
const winston = require('../../helpers/winston.logger')
/*
    Services
 */
const getCardRegistration = require('./services/getCardRegistration')
const getMasterCard = require('./services/getMasterCard')
const getMessage = require('./services/getMessage')
const getSetting = require('./services/getSetting')

const controller = async (req, res) => {
    let result = {}
	const location = "ACTIVATION VALIDATE"
    try {

        let {
            body
        } = req

        await db.transaction(async trx => {

            const masterCard = await getMasterCard(body, trx)
            if (!masterCard) {
                // data kartu tidak ditemukan
                const message = await getMessage(1, 'CARD ACTIVATION', '02', trx)
                result = {
                    status: message.c_status || '02',
                    message: message.n_desc || 'Data kartu tidak ditemukan !',
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            const cardRegistration = await getCardRegistration(body.c_registration_code, trx)
            if (!cardRegistration) {
                // data registrasi tidak ditemukan
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '03', trx)
                result = {
                    status: message.c_status || '03',
                    message: message.n_desc || 'Data registrasi tidak ditemukan !',
                    data: {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            let today = moment(cardRegistration.date_on_server)

            const isLastMonth = await getSetting('ECMS04', trx)

            let d_expired = ""

            if (isLastMonth?.e_setting.toUpperCase() == 'TRUE') {
                console.log("mode 1")
                const cardRenewalPeriod = await getSetting('ECMS05', trx)
                if (!cardRenewalPeriod.e_setting) {
                    const message = await getMessage(0, 'UPDATE CARD EXPIRED', "08", trx)
                    
                    result = {
                        status: message?.c_status || '08',
                        message: message?.n_desc || 'HUBUNGI ANDMINISTRATOR UNTUK MELAKUKAN PENGATURAN CARD RENEWAL PERIOD',
                        data: {}
                    }
                    // log info
                    winston.logger.warn(
                        `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                    );

                    return res.status(200).send(result)
                }

                // cek expired date pada kartu dengan hari ini
                const endOfMonth = moment(today).endOf('month').format('YYYY-MM-DD');
                const minUpdaeteExpiredDate = moment(today).set('date', parseInt(cardRenewalPeriod?.e_setting || 20)).format('YYYY-MM-DD');
                
                // if (today.isBetween(minUpdaeteExpiredDate, endOfMonth)) d_expired = moment(endOfMonth).add(1, 'months').format('YYYY-MM-DD')
                if (today.isBetween(minUpdaeteExpiredDate, endOfMonth)) d_expired = moment(endOfMonth).add(cardRegistration.i_card_active_time_in_days, 'd').format('YYYY-MM-DD')
                
                if (!today.isBetween(minUpdaeteExpiredDate, endOfMonth)) d_expired = endOfMonth
                
            }else{
                d_expired = cardRegistration.d_active_date ? moment(cardRegistration.d_active_date).add(cardRegistration.i_card_active_time_in_days, 'd').format('YYYY-MM-DD') : ""
            }

            let data = {
                i_card_type: masterCard.i_card_type || "",
                n_card_type: masterCard.n_card_type || "",
                c_uid: masterCard.c_uid || "",
                c_card_number: masterCard.c_card_number ? masterCard.c_card_number : "",
                n_identity_number: cardRegistration.n_identity_number ? cardRegistration.n_identity_number : "",
                n_fullname: cardRegistration.n_fullname ? cardRegistration.n_fullname : "",
                n_company_name: cardRegistration.n_company_name ? cardRegistration.n_company_name : "",
                c_registration_code: cardRegistration.c_registration_code ? cardRegistration.c_registration_code : "",
                c_specific_station: cardRegistration.c_specific_station ? cardRegistration.c_specific_station : "",
                n_specific_station: cardRegistration.n_specific_station ? cardRegistration.n_specific_station : "",
                d_active_date: cardRegistration.d_active_date,
                d_expired_date: d_expired,
                i_perso_status: masterCard.i_perso_status ? masterCard.i_perso_status : "",
                i_card_active_time_in_days: cardRegistration.i_card_active_time_in_days ? cardRegistration.i_card_active_time_in_days.toString() : "",
                c_unique: req.c_unique
            }

            if (cardRegistration.d_activation) {
                // No registrasi sudah teraktivasi
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '04', trx)
                result = {
                    status: message.c_status || '04',
                    message: message.n_desc || 'No registrasi sudah teraktivasi !',
                    data: data || {}
                }

                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (cardRegistration.i_card_type != masterCard.i_card_type) {
                // tipe kartu didak sesuai
                const message = await getMessage(cardRegistration.i_card_type, 'CARD ACTIVATION', '05', trx)
                result = {
                    status: message?.c_status || '05',
                    message: message?.n_desc || 'Tipe Kartu Tidak Sesuai !',
                    data: data || {}
                }

                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (!masterCard.b_active) {
                // kartu sudah tidak aktif
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '06', trx)
                result = {
                    status: message.c_status || '06',
                    message: message.n_desc || 'Kartu sudah tidak aktif !',
                    data: data || {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (masterCard.i_blacklist_status) {
                // kartu terkena blacklist
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '07', trx)
                result = {
                    status: message.c_status || '07',
                    message: message.n_desc || 'Kartu terkena blacklist !',
                    data: data || {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (masterCard.b_already_used) {
                // kartu sudag digunakan
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '08', trx)
                result = {
                    status: message.c_status || '08',
                    message: message.n_desc || 'Kartu sudah digunakan !',
                    data: data || {}
                }
                // log info
                winston.logger.warn(
                    `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            // sukses
            const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '00', trx)
            result = {
                status: message.c_status || '00',
                message: message.n_desc || 'Sukses',
                data: data || {}
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