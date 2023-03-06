/*
    Config
 */
const db = require('../../config/database')

/*
    Services
*/
const insertActivation = require('./services/insertActivation')
const getTerminal = require('./services/getTerminal')
const getMessage = require('./services/getMessage')

const controller = async (req, res) => {

    try {

        let {
            body
        } = req || ""
        // Jika c_status dari depan != 00 maka kartu gagal di aktivasi 
        await db.transaction(async trx => {

            const terminal = await getTerminal(body.c_pos, trx)

            await trx('ecms.t_m_request_code').insert({c_request_code: body.c_unique})
            
            const activation = await insertActivation(body, terminal, req.n_user, req.c_login, trx)
            if (!activation) {
                const message = await getMessage(body.i_card_type, 'CARD ACTIVATION', '01', trx)

                return res.status(200).send({
                    status: message?.c_status || '01',
                    message: message?.n_desc || 'KARTU GAGAL DIAKTIVASI !',
                    data: {
                        'c_uid': body.c_uid || '',
                        "c_card_number": body.c_card_number || '',
                        "i_perso_status": body.i_perso_status || '',
                        "c_status": body.c_status || ''
                    }
                })
            }

            // sukses
            const message = await getMessage(body.i_card_type, 'CARD ACTIVATION', "00", trx)
            return res.status(200).send({
                status: message.c_status || body.c_status,
                message: message.n_desc || 'Sukses',
                data: {
                    'c_uid': body.c_uid,
                    "c_card_number": body.c_card_number,
                    "i_perso_status": '1',
                    "c_status": body.c_status
                }
            })
        })

    } catch (e) {
        console.error("[x] message : ", e.message)
        return res.status(200).send({ //500
            status: '99',
            message: "Terjadi kesalahan system !",
            data: {}
        })
    }
}

module.exports = controller;