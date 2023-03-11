/* 
 ;==========================================
 ; Title    : Request Middleware
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

const db = require('../config/database')
const winston = require('../helpers/winston.logger')

const middleware = async (req, res, next) => {
    let result = {}
    const location = "REQUEST MIDDLEWARE"
    try {

        const requestId = req.body.c_unique ? req.body.c_unique : null

        const check = await db('ecms.t_m_request_code').first('c_request_code').where('c_request_code', '=', requestId)
        
        if(check){

            result = {
				status: '90',
				message: 'Request ID telah digunakan, silahkan lakukan validasi ulang',
				data: check
			}

			// log info
			winston.logger.info(
				`${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)}`
			);
			return res.status(200).send(result)  
        }

        next();
        
    } catch (e) {
        
        result = { //500
            status: '99',
            message:  "Terjadi kesalahan system !",
            data: e.message
        }

        // log info
        winston.logger.error(
            `${req.requestId} | ${req.requestUrl} | LOCATION : ${location} | RESPONSE : ${JSON.stringify(result)} ERROR : ${e.message}`
        );

        return res.status(200).send(result)
    }


}

module.exports = middleware;