/*
    Config
 */
const db = require('../../config/database')
const winston = require('../../helpers/winston.logger')

/*
	Services
*/
const _addStock = require('./services/_addStock')
const getAddStock = require('./services/getAddStock')

const controller = async (req, res) => {
	console.log("SAMPE SINI NIH")
	let result = {}
	try {

		let {
			body
		} = req || ""
		
		await db.transaction(async trx => {
			const checkAddStock = await getAddStock(body.c_login, trx)

			if(!checkAddStock && body.q_employee_card == "0" && body.q_master_card == "0" && body.q_tenant_card == "0"){
				result = {
					status: '00',
					message: 'success',
					data: {}
				}

				// log info
				winston.logger.info(
					`${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
				);

				return res.status(200).send(result)   
			}

			const addstock = await _addStock(body, trx)
			if (!addstock) {
				result = {
					status: '01',
					message: 'Failed Addstock!',
					data: {}
				}
				
				// log info
				winston.logger.warn(
					`${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
				);
				return res.status(200).send(result)  
			}

			result = {
				status: '00',
				message: 'success',
				data: {}
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