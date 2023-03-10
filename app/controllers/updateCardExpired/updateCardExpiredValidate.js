const moment = require('moment')

/*
    Config
 */
const db = require('../../config/database')
const helper = require('../../helpers/helper')
const winston = require('../../helpers/winston.logger')
/*
    Services
*/
const getMessage = require('./services/getMessage')
const getSetting = require('./services/getSetting')
const getCardOwnerDetail = require('./services/getCardOwnerDetail')
const getMasterCard = require('./services/getMasterCard')

const controller = async (req, res) => {
    let result = {}
    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {
            
            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} getting cardOwnerDetail...`);

            const cardOwnerDetail = await getCardOwnerDetail(body.c_card_number, trx)

            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result cardOwnerDetail : ${JSON.stringify(cardOwnerDetail)}`);

            // jika data owner kartu dan data kartu tidak ditemukan
            if (!cardOwnerDetail) {
                const message = await getMessage(body.i_card_type, 'UPDATE CARD EXPIRED', "07", trx)
                
                result = {
                    status: message?.c_status || '02',
                    message: message?.n_desc || 'Data Employee/Tenant Tidak Ditemukan',
                    data: {}
                }

                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} getting masterCard...`)

            const masterCard = await getMasterCard(body.i_card_type, body.c_card_number, trx)

            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result masterCard : ${JSON.stringify(masterCard)}`);

            // jika data kartu dan data kartu tidak ditemukan
            if (!masterCard) {
                const message = await getMessage(body.i_card_type, 'UPDATE CARD EXPIRED', "03", trx)
                result = {
                    status: message?.c_status || "03",
                    message: message?.n_desc || "Data Kartu tidak ditemukan",
                    data: {}
                }

                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            let today = moment(cardOwnerDetail.date_on_server)

            let d_expired = ''
            let d_active = ''
            let expiredDate = ''
            let minUpdaeteExpiredDate = ''
            let endOfMonth = ''

            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} getting cardERenewal...`)

            const cardERenewal = await getSetting('ECMS04', trx)
            // log debug
            winston.logger.debug(`${req.requestId} ${req.requestUrl} result cardERenewal : ${JSON.stringify(masterCard)}`);

            if (!cardERenewal?.e_setting) {
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "08", trx)
                result = {
                    status: message?.c_status || '08',
                    message: message?.n_desc || 'HUBUNGI ANDMINISTRATOR UNTUK MELAKUKAN PENGATURAN CARD RENEWAL STATE',
                    data: {}
                }

                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (cardERenewal?.e_setting.toUpperCase() == 'TRUE') {
                const cardRenewalPeriod = await getSetting('ECMS05', trx)
            
                if (!cardRenewalPeriod?.e_setting) {
                    const message = await getMessage(0, 'UPDATE CARD EXPIRED', "08", trx)

                    result = {
                        status: message?.c_status || '08',
                        message: message?.n_desc || 'HUBUNGI ANDMINISTRATOR UNTUK MELAKUKAN PENGATURAN CARD RENEWAL PERIOD',
                        data: {}
                    }

                    // log info
                    winston.logger.info(
                        `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                    );

                    return res.status(200).send(result)
                }

                // cek expired date pada kartu dengan hari ini
                let expired_on_card = ""
                if (today.isAfter(moment(body.d_expired_date_on_card).format('YYYY-MM-DD'))) {
                    expired_on_card = today.format('YYYY-MM-DD')
                    d_active = today.format('YYYY-MM-DD')
                } else {
                    expired_on_card = body.d_expired_date_on_card
                    d_active = moment(body.d_expired_date_on_card).format('YYYY-MM-DD')
                }

                //  cek apakah card expired sudah terlewat, 
                //  jika sudah maka active date di set ke hari ini
                //  jika belum maka set ke expired date di kartu

                // cek expired date pada kartu dengan hari ini
                endOfMonth = moment(expired_on_card).endOf('month').format('YYYY-MM-DD');
                minUpdaeteExpiredDate = moment(expired_on_card).set('date', parseInt(cardRenewalPeriod?.e_setting || 20)).format('YYYY-MM-DD');
                
                d_expired = moment(endOfMonth).add(1, 'months').format('YYYY-MM-DD');

                // if (today.isBetween(minUpdaeteExpiredDate, endOfMonth)) {
                // } else if(moment(today).isAfter(moment(body.d_expired_date_on_card).format('YYYY-MM-DD'))) {
                //     d_expired = moment(today).
                // } else {
                //     d_expired = endOfMonth
                // }

                expiredDate = moment(d_expired).format('YYYY-MM-DD')

            }

            if (cardERenewal?.e_setting.toUpperCase() == 'FALSE') {
                const cardRenewalPeriod = await getSetting('ECMS03', trx)
                console.log("Card renewal mode : ", 2)
                if (!cardRenewalPeriod?.e_setting) {
                    const message = await getMessage(0, 'UPDATE CARD EXPIRED', "08", trx)
                    result = {
                        status: message?.c_status || '08',
                        message: message?.n_desc || 'HUBUNGI ANDMINISTRATOR UNTUK MELAKUKAN PENGATURAN CARD RENEWAL PERIOD',
                        data: {}
                    }

                    // log info
                    winston.logger.info(
                        `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                    );

                    return res.status(200).send(result)
                }

                // cek expired date pada kartu dengan hari ini
                if (today.isAfter(moment(body.d_expired_date_on_card).format('YYYY-MM-DD'))) {
                    d_expired = today.format('YYYY-MM-DD')
                } else {
                    d_expired = body.d_expired_date_on_card
                }

                expiredDate = moment(d_expired).add(cardOwnerDetail.i_card_active_time_in_days, 'd').format('YYYY-MM-DD')
                minUpdaeteExpiredDate = moment(body.d_expired_date_on_card).subtract(cardRenewalPeriod.e_setting, 'd').format('YYYY-MM-DD')
    
            }

            const data = {
                c_unique: req.c_unique,
                i_card_registration: cardOwnerDetail.i_id || "",
                c_registration_code: cardOwnerDetail.c_registration_code || "",
                i_card_type: cardOwnerDetail.i_card_type.toString() || "",
                n_card_type: cardOwnerDetail.n_card_type || "",  
                c_uid: cardOwnerDetail.c_uid || "",
                c_card_number: cardOwnerDetail.c_card_number || "",
                c_specific_station: cardOwnerDetail.c_specific_station || "",
                n_specific_station: cardOwnerDetail.n_specific_station || "",
                i_card_active_time_in_days: cardOwnerDetail.i_card_active_time_in_days.toString() || "",
                // d_update_card_expired: today.format('YYYY-MM-DD'),
                d_update_card_expired: moment(cardOwnerDetail.date_on_server).format('YYYY-MM-DD HH:mm:ss') || "",
                d_active_date: moment(d_active).format('YYYY-MM-DD') || "", // hari awal
                d_expired_date_on_card: body.d_expired_date_on_card || "",
                d_min_update_card_expired: minUpdaeteExpiredDate || "",
                d_expired_date: expiredDate || "", // hari expired
                n_employee_type_name: cardOwnerDetail.n_employee_type_name || "",
                n_identity_type_code: cardOwnerDetail.n_identity_type_code || "",
                n_identity_number: cardOwnerDetail.n_identity_number || "",
                n_fullname: cardOwnerDetail.n_fullname || "",
                n_company_name: cardOwnerDetail.n_company_name || "",
            }

            if (!cardOwnerDetail.b_active) {
                // employee/tenant tidak aktif
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "02", trx)
                result = {
                    status: message?.c_status || '02',
                    message: message?.n_desc || 'Employee / Tenant Sudah Tidak Aktif',
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status,
                            c_desc: message?.c_desc || ""
                        }
                    } || {}
                }
                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (! today.isAfter(minUpdaeteExpiredDate) && today.isBefore(endOfMonth)) {
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "06", trx)

                result = {
                    status: message?.c_status || '06',
                    message: message?.n_desc || 'Belum Masuk Waktu Perpanjang',
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status,
                            c_desc: message?.c_desc || ""
                        }
                    } || {}
                }

                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)

            }

            if (!masterCard.b_active) {
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "05", trx)
                result = {
                    status: message?.c_status || "05",
                    message: message?.n_desc || "Kartu sudak tidak aktif",
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status,
                            c_desc: message?.c_desc|| ""
                        }
                    } || {}
                }

                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            if (masterCard.i_blacklist_status != null) {
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "07", trx)
                result = {
                    status: message?.c_status || "07",
                    message: message?.n_desc || "Kartu Terkena Blacklist !",
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status, 
                            c_desc: message?.c_desc || ""
                        }
                    }
                }
                // log info
                winston.logger.info(
                    `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result)
            }

            const message = await getMessage(0, 'UPDATE CARD EXPIRED', '00', trx)

            result = {
                status: message?.c_status || "00",
                message: message?.n_desc || "Sukses",
                data: {
                    ...data,
                    ...{
                        c_status: message?.c_status,
                        c_desc: message?.c_desc || ""
                    }
                } || {}
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