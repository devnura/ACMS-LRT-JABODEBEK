const moment = require('moment')

/*
    Config
 */
const db = require('../../config/database')

/*
    Services
 */
const getCardRegistration = require('./services/getCardRegistration')
const getMasterCard = require('./services/getMasterCard')
const getMessage = require('./services/getMessage')

const controller = async (req, res) => {

    try {

        let {
            body
        } = req

        await db.transaction(async trx => {

            const masterCard = await getMasterCard(body, trx)
            if (!masterCard) {
                // data kartu tidak ditemukan
                const message = await getMessage(1, 'CARD ACTIVATION', '02', trx)
                return res.status(200).send({
                    status: message.c_status || '02',
                    message: message.n_desc || 'Data kartu tidak ditemukan !',
                    data: {}
                })
            }

            const cardRegistration = await getCardRegistration(body.c_registration_code, trx)
            if (!cardRegistration) {
                // data registrasi tidak ditemukan
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '03', trx)
                return res.status(200).send({
                    status: message.c_status || '03',
                    message: message.n_desc || 'Data registrasi tidak ditemukan !',
                    data: {}
                })
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
                d_active_date: cardRegistration.d_active_date ? moment(cardRegistration.d_active_date).format('YYYY-MM-DD HH:mm:ss') : "",
                d_expired_date: cardRegistration.d_active_date ? moment(cardRegistration.d_active_date).add(cardRegistration.i_card_active_time_in_days, 'd').format('YYYY-MM-DD') : "",
                i_perso_status: masterCard.i_perso_status ? masterCard.i_perso_status : "",
                i_card_active_time_in_days: cardRegistration.i_card_active_time_in_days ? cardRegistration.i_card_active_time_in_days.toString() : "",
                c_unique: req.c_unique
            }

            if (cardRegistration.d_activation) {
                // No registrasi sudah teraktivasi
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '04', trx)
                return res.status(200).send({
                    status: message.c_status || '04',
                    message: message.n_desc || 'No registrasi sudah teraktivasi !',
                    data: data || {}
                })
            }

            if (cardRegistration.i_card_type != masterCard.i_card_type) {
                // tipe kartu didak sesuai
                const message = await getMessage(cardRegistration.i_card_type, 'CARD ACTIVATION', '05', trx)
                return res.status(200).send({
                    status: message?.c_status || '05',
                    message: message?.n_desc || 'Tipe Kartu Tidak Sesuai !',
                    data: data || {}
                })
            }

            if (!masterCard.b_active) {
                // kartu sudah tidak aktif
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '06', trx)
                return res.status(200).send({
                    status: message.c_status || '06',
                    message: message.n_desc || 'Kartu sudah tidak aktif !',
                    data: data || {}
                })
            }

            if (masterCard.i_blacklist_status) {
                // kartu terkena blacklist
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '07', trx)
                return res.status(200).send({
                    status: message.c_status || '07',
                    message: message.n_desc || 'Kartu terkena blacklist !',
                    data: data || {}
                })
            }

            if (masterCard.b_already_used) {
                // kartu sudag digunakan
                const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '08', trx)
                return res.status(200).send({
                    status: message.c_status || '08',
                    message: message.n_desc || 'Kartu sudah digunakan !',
                    data: data || {}
                })
            }

            // sukses
            const message = await getMessage(masterCard.i_card_type, 'CARD ACTIVATION', '00', trx)
            return res.status(200).send({
                status: message.c_status || '00',
                message: message.n_desc || 'Sukses',
                data: data || {}
            })
        })
    } catch (e) {
        // error server
        console.error("[x] message : ", e.message)
        return res.status(200).send({ //500
            status: '99',
            message:  "Terjadi kesalahan system !",
            data: {}
        })
    }
}

module.exports = controller;