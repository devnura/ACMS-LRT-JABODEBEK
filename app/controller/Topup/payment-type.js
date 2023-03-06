const _response = require('../../config/response')
const _service = require('../../service/Topup/service-payment-type')

const controllers = async (req, res) => {

    try {
        
        let { c_terminal, c_station, i_transaction_type } = req.body || "";

        // * Check Terminal
        if (typeof(c_terminal) == undefined || c_terminal == '') return _response.success(res, "302", {});

        // * Check Station
        if (typeof(c_station) == undefined || c_station == '') return _response.success(res, "311", {});

        // * Get Data Payment
        let payment = await _service.dataPayment(i_transaction_type);
        return _response.success(res, "00", payment);

    } catch (e) {
        _response.error(res, e.message)
    }

}

module.exports = controllers;