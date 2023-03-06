const _response = require('../../config/response');
const _service = require('../../service/Topup/service-check-payment');

const controller = async (req, res) => {

    try {
        
        let { c_terminal, c_station, c_login, c_header } = req.body;

        // == Check Terminal
        let terminal = await _service.terminal(c_terminal);
        if (terminal.rowCount <= 0) return _response.success(res, "302", {});
        
        var c_station_check = terminal.rows[0].c_station;
        if (c_station_check.trim() != c_station.trim()) return _response.success(res, "310", {});
        
        // == Check Station
        let station = await _service.station(c_station);
        if (station.rowCount <= 0) return _response.success(res, "311", {});
        if (station.rows[0].b_active == null) return _response.success(res, "311", {});
        if (!station.rows[0].b_active) return _response.success(res, "312", {});

        // == Check Login
        let openshift = await _service.openshift(c_terminal, c_station);
        if (openshift.rowCount <= 0) return _response.success(res, "300", {});
        if (openshift.rows[0].c_login != c_login) return _response.success(res, "309", {});

        // == Check Header Code Payment
        let header = await _service.headercode(c_header);
        if (header.rowCount <= 0) return _response.success(res, "318", {});
        return _response.success(res, "00", {});

    } catch (e) {
        return _response.success(res, e.message);
    }

}

module.exports = controller;