/*
    Config
 */
const db = require('../../config/database')

/*
    Services
*/
const updateCardExpired = require('./services/updateCardExpired')
const getMessage = require('./services/getMessage')

const controller = async (req, res) => {
    try {

        let {
            body
        } = req || ""

        await db.transaction(async trx => {

            await trx('ecms.t_m_request_code').insert({c_request_code: body.c_unique})
            
            const updatecardexpired = await updateCardExpired(body, trx)
            if (!updatecardexpired) {
             const message = await getMessage("0", 'UPDATE CARD EXPIRED', '01', trx)
             return res.status(200).send({
                 status: message.c_status || '01',
                 message: message.n_desc || 'Proses Update Kartu Gagal !',
                 data: {}
             })
            }

            const message = await getMessage("0", 'UPDATE CARD EXPIRED', '00', trx)
             return res.status(200).send({
                 status: message.c_status || '00',
                 message: message.n_desc || 'Sukses',
                 data: {}
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