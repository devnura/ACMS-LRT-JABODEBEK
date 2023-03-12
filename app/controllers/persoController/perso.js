/*
    Config
 */
const db = require('../../config/database')

/*
    Services
*/
const insertPerso = require('./services/insertPerso')
const getMessage = require('./services/getMessage')
const getTerminal = require('./services/getTerminal')
const getMasterCard = require('./services/getMasterCard')

const controller = async (req, res) => {
    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {
        
        const terminal = await getTerminal(body.c_pos, trx)
        if (!terminal) {
            return res.status(200).send({
                status: '02',
                message: "Invalid terminal code !",
                data: {}
            })
        }
        const card = await getMasterCard(body, trx)
        if (!card) {
            const message = await getMessage("0", 'CARD PERSO', '02', trx)
            return res.status(200).send({
                status: message?.c_status || '02',
                message: message?.n_desc || 'Data Kartu Tidak Ditemukan !',
                data: {}
            })
        }
        const perso = await insertPerso(body, terminal, card, trx)
        if (!perso) {
            const message = await getMessage(body.i_card_type, 'CARD PERSO', '01', trx)
            return res.status(200).send({
                status: message?.c_status || '01',
                message: message?.n_desc || 'Data Kartu Tidak Ditemukan !',
                data: {}
            })
        }

       const insertRequestCode = await trx('ecms.t_m_request_code').insert({c_request_code: body.c_unique}, ["c_request_code"])

        const message = await getMessage(body.i_card_type, 'CARD PERSO', '00', trx)
        return res.status(200).send({
            status: message?.c_status || '00',
            message: message?.n_desc || 'Sukses !',
            data: {
                insertRequestCode,
                perso 
            }
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