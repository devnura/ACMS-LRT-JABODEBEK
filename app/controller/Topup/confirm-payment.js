const _response = require('../../config/response');
const _service = require('../../service/Topup/service-confirm-payment')

const controller = async (req, res) => {
    
    try {
        
        let { c_terminal, c_station, c_login, c_header_code } = req.body;
        
        // * Check Login
        if (typeof(c_login) == undefined || c_login == '') return _response.success(res, "300", {});

        // * Check Terminal
        if (typeof(c_terminal) == undefined || c_terminal == '') return _response.success(res, "302", {});

        // * Check Station
        if (typeof(c_station) == undefined || c_station == '') return _response.success(res, "311", {});
        
        // * Check Header Code
        let header = await _service.headercode(c_header_code);
        if (header.rowCount <= 0) return _response.success(res, "317", {});
        
        if (header.rows[0].ref_no == null) {

            // * Payment Cash
            if (header.rows[0].i_payment_type == 1) {

                var data_send = {
                    c_header_code: header.rows[0].c_header_code,
                    i_payment_type: header.rows[0].i_payment_type,
                    m_total: header.rows[0].m_total,
                    c_login: c_login,
                    c_terminal: c_terminal,
                    c_station: c_station
                }
                
                // * Process Confirm Payment
                let process_confirm = await _service.processConfirm(data_send);
                if (!process_confirm) return _response.success(res, "320", {});
                return _response.success(res, "00", {});

            }

            // * Payment QRIS
            
        } else {
            return _response.success(res, "00", {});
        }
        
    } catch (e) {
        return _response.error(res, e.message);
    }
    
}

module.exports = controller;