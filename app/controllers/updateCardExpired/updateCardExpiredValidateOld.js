const moment = require('moment')

/*
    Config
 */
const db = require('../../config/database')

/*
    Services
*/
const getMessage = require('./services/getMessage')
const getSetting = require('./services/getSetting')
const getCardOwnerDetail = require('./services/getCardOwnerDetail')
const getMasterCard = require('./services/getMasterCard')

const controller = async (req, res) => {

    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {

            const cardOwnerDetail = await getCardOwnerDetail(body.c_card_number, trx)
            // jika data owner kartu dan data kartu tidak ditemukan
            if (!cardOwnerDetail) {
                const message = await getMessage(body.i_card_type, 'UPDATE CARD EXPIRED', "07", trx)
                return res.status(200).send({
                    status: message?.c_status || '02',
                    message: message?.n_desc || 'Data Employee/Tenant Tidak Ditemukan',
                    data: {}
                })
            }

            const masterCard = await getMasterCard(body.i_card_type, body.c_card_number, trx)

            // jika data kartu dan data kartu tidak ditemukan
            if (!masterCard) {
                const message = await getMessage(body.i_card_type, 'UPDATE CARD EXPIRED', "03", trx)
                return res.status(200).send({
                    status: message?.c_status || "03",
                    message: message?.n_desc || "Data Kartu tidak ditemukan",
                    data: {}
                })
            }

            let today = moment(cardOwnerDetail.date_on_server)

            let d_expired = ''

            // cek expired date pada kartu dengan hari ini
            if (today.isAfter(moment(body.d_expired_date_on_card).format('YYYY-MM-DD'))) {
                d_expired = today.format('YYYY-MM-DD')
            } else {
                d_expired = body.d_expired_date_on_card
            }

            const expiredDate = moment(d_expired).add(cardOwnerDetail.i_card_active_time_in_days, 'd').format('YYYY-MM-DD')
            const cardRenewalPeriod = await getSetting('ECMS03', trx)
            const minUpdaeteExpiredDate = moment(body.d_expired_date_on_card).subtract(cardRenewalPeriod.e_setting, 'd').format('YYYY-MM-DD')

            // const daysLeft = today.diff(moment(body.d_expired_date_on_card), 'days')

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
                d_active_date: moment(d_expired).format('YYYY-MM-DD') || "",
                d_expired_date_on_card: body.d_expired_date_on_card || "",
                d_min_update_card_expired: minUpdaeteExpiredDate || "",
                d_expired_date: expiredDate || "",
                n_employee_type_name: cardOwnerDetail.n_employee_type_name || "",
                n_identity_type_code: cardOwnerDetail.n_identity_type_code || "",
                n_identity_number: cardOwnerDetail.n_identity_number || "",
                n_fullname: cardOwnerDetail.n_fullname || "",
                n_company_name: cardOwnerDetail.n_company_name || "",
            }

            // let currentData = today.format('YYYY-MM-DD')

            if (!cardOwnerDetail.b_active) {
                // employee/tenant tidak aktif
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "02", trx)
                return res.status(200).send({
                    status: message?.c_status || '02',
                    message: message?.n_desc || 'Employee / Tenant Sudah Tidak Aktif',
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status,
                            c_desc: message?.c_desc || ""
                        }
                    } || {}
                })
            }

            if (moment(today.format('YYYY-MM-DD')).isBefore(minUpdaeteExpiredDate)) {
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "06", trx)
                return res.status(200).send({
                    status: message?.c_status || '06',
                    message: message?.n_desc || 'Belum Masuk Waktu Perpanjang',
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status,
                            c_desc: message?.c_desc || ""
                        }
                    } || {}
                })
            }

            if (!masterCard.b_active) {
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "05", trx)
                return res.status(200).send({
                    status: message?.c_status || "05",
                    message: message?.n_desc || "Kartu sudak tidak aktif",
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status,
                            c_desc: message?.c_desc|| ""
                        }
                    } || {}
                })
            }

            if (masterCard.i_blacklist_status != null) {
                const message = await getMessage(0, 'UPDATE CARD EXPIRED', "07", trx)
                return res.status(200).send({
                    status: message?.c_status || "07",
                    message: message?.n_desc || "Kartu Terkena Blacklist !",
                    data: {
                        ...data,
                        ...{
                            c_status: message?.c_status, 
                            c_desc: message?.c_desc || ""
                        }
                    }
                })
            }

            const message = await getMessage(0, 'UPDATE CARD EXPIRED', '00', trx)

            return res.status(200).send({
                status: message?.c_status || "00",
                message: message?.n_desc || "Sukses",
                data: {
                    ...data,
                    ...{
                        c_status: message?.c_status,
                        c_desc: message?.c_desc || ""
                    }
                } || {}
            })
        })

    } catch (e) {
        console.error("[x] message : ", e.message)
        return res.status(200).send({ //500
            status: '99',
            message:  "Terjadi kesalahan system !",
            data: {}
        })
    }
}

module.exports = controller;