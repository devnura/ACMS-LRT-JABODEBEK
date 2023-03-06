const checkConnectionDevices = require('./services/checkConnectionDevices')
// const moment = require('moment')
const controller = async (req, res) => {
	try {

		let {
			body
		} = req || ""

		const connection = await checkConnectionDevices(body.c_pos)

		return res.status(200).send({
			status: '00',
			message: 'success',
			data: {
				n_station: connection?.n_station || ""
			}
		})
		
	} catch (e) {
		return res.status(200).send({
			status: '05',
			message: e.message,
			data: {}
		})

	}
}

module.exports = controller;