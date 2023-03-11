/* 
 ;==========================================
 ; Title    : Perso Validate
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

/*
    Config
 */
const db = require('../../config/database')

/*
    Services
*/
const getMasterCard = require('./services/getMasterCard')
const getMessage = require('./services/getMessage')

const controller = async (req, res) => {
    let result = {}
	const location = "PERSO CONTOLLER"
    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {

            const masterCard = await getMasterCard(body, trx)
            if (!masterCard) {
                const message = await getMessage("0", 'CARD PERSO', '02', trx)
                return res.status(200).send({
                    status: message?.c_status || '02',
                    message: message?.n_desc || 'Data Kartu Tidak Ditemukan !',
                    data: {}
                })
            }

            const data = {
                i_card_type: masterCard?.i_card_type  || "",
                n_card_type: masterCard?.n_card_type  || "",
                c_uid: masterCard?.c_uid || "",
                c_card_number: masterCard?.c_card_number || "",
                d_perso_at: masterCard?.d_perso_at || "",
                c_unique: req.c_unique
            }

            if (masterCard.i_blacklist_status) {
                const message = await getMessage("0", 'CARD PERSO', '03', trx)
                return res.status(200).send({
                    status: message?.c_status || '03',
                    message: message?.n_desc || 'Kartu Terkena Blacklist !',
                    data: data
                })
            }

            if (!masterCard.b_active) {
                const message = await getMessage("0", 'CARD PERSO', '04', trx)
                return res.status(200).send({
                    status: message?.c_status || '04',
                    message: message?.n_desc || 'Kartu Sudah Tidak Aktif !',
                    data: data
                })
            }

            if (masterCard.b_already_used) {
                const message = await getMessage("0", 'CARD PERSO', '05', trx)
                return res.status(200).send({
                    status: message?.c_status || '05',
                    message: message?.n_desc || 'Kartu Sudah Tidak Aktif !',
                    data: data
                })
            }
            
            const message = await getMessage("0", 'CARD PERSO', '00', trx)
            return res.status(200).send({
                status: message?.c_status || '00',
                message: message?.n_desc || 'Sukses',
                data: data
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