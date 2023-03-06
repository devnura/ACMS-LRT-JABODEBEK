const _response = require('../../config/response')
const _service = require('../../service/Topup/service-topup-info')

const controller = async (req, res) => {
    
    try {
        
        let { c_terminal, c_station, c_login, m_nominal, m_balance } = req.body;
        
        // * Check Login
        if (typeof(c_login) == undefined || c_login == '') return _response.success(res, "300", {});
        
        // * Check Terminal
        if (typeof(c_terminal) == undefined || c_terminal == '') return _response.success(res, "302", {});
        
        // * Check Station
        if (typeof(c_station) == undefined || c_station == '') return _response.success(res, "311", {});
        
        // * Admin Fee
        let admin_fee = await _service.checkAdminFee();
        var fee = (admin_fee.rowCount <= 0) ? 0 : admin_fee.rows[0].e_setting;

        // * Check Saldo setelah topup
        if ((m_balance + (m_nominal - fee)) > 20000000) return _response.success(res, "321", {});

        var respon = {
            m_admin_fee: fee,
            m_nominal_topup: m_nominal - fee,
            m_total: m_nominal
        }
        
        return _response.success(res, "00", respon);
        
    } catch (e) {
        return _response.error(res, e.message);
    }
    
}

module.exports = controller;