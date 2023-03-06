/*
    Config
 */
    const db = require('../../config/database')

    /*
        Services
    */
    const getLoginInfo = require('./services/getLoginInfo')
    
    const controller = async (req, res) => {
        try {
    
            let {
                body
            } = req || ""

            // return res.status(200).send({
            //     status: '00',
            //     message: 'success',
            //     data: body
            // })
            
            await db.transaction(async trx => {
                const loginInfo = await getLoginInfo(body, trx)
                if (!loginInfo) {
                    return res.status(200).send({
                        status: '01',
                        message: 'Invalid code login!',
                        data: {}
                    })
                }
    
                return res.status(200).send({
                    status: '00',
                    message: 'success',
                    data: loginInfo
                })
            })
    
    
        } catch (e) {
            return res.status(200).send({
                status: '99',
                message: e.message,
                data: {}
            })
    
        }
    }
    
    module.exports = controller;