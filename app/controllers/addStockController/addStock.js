/*
    Config
 */
const db = require('../../config/database')

/*
	Services
*/
const _addStock = require('./services/_addStock')

const controller = async (req, res) => {
	try {

		let {
			body
		} = req || ""
		
		await db.transaction(async trx => {
			const addstock = await _addStock(body, trx)
			if (!addstock) {
				return res.status(200).send({
					status: '01',
					message: 'Failed Addstock!',
					data: {}
				})
			}

			return res.status(200).send({
				status: '00',
				message: 'success',
				data: {}
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