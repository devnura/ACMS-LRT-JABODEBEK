const db = require('../config/database')

const middleware = async (req, res, next) => {

    try {

        const requestId = req.body.c_unique ? req.body.c_unique : null

        const check = await db('ecms.t_m_request_code').first('c_request_code').where('c_request_code', '=', requestId)
        
        if(check){
            return res.status(200).send({ //500
                status: '00',
                message: "Sukses",
                data: {}
            })
        }

        next();
        
    } catch (e) {
        console.error("[x] message : ", e.message)
        return res.status(200).send({ //500
            status: '99',
            message: "Terjadi Kesalahan System !",
            data: {}
        })
    }


}

module.exports = middleware;