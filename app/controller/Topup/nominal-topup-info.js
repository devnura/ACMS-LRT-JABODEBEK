const _service = require('../../service/Topup/service-nominal-topup-info');
const _response = require('../../config/response');

const controllers = async (req, res) => {

    try {
        
        let { c_terminal, c_station, c_login } = req.body;

        // * Check Login
        if (typeof(c_login) == undefined || c_login == '') return _response.success(res, "300", {});

        // * Check Terminal
        if (typeof(c_terminal) == undefined || c_terminal == '') return _response.success(res, "302", {});

        // * Check Station
        if (typeof(c_station) == undefined || c_station == '') return _response.success(res, "311", {});

        // * Nominal
        let checkNominal = await _service.checkNominal();
        var nominal = checkNominal.rows;
        var arr = [];
        for (let x = 0; x < nominal.length; x++) {
            arr.push(nominal[x].m_nominal);
        }

        return _response.success(res, "00", arr);

    } catch (e) {
        return _response.error(res, e.message);
    }

}

module.exports = controllers;