const _response = require('../../config/response');
const _service = require('../../service/Topup/service-generate-payment');
const moment = require('moment');
const randomstring = require('randomstring');

const controller = async (req, res) => {
    
    try {
        
        let { c_terminal, c_station, c_login, m_balance_before, i_payment_type, m_admin_fee, m_nominal, m_total } = req.body;
        let i_transaction_type = 2;
        
        // * Check Login
        if (typeof(c_login) == undefined || c_login == '') return _response.success(res, "300", {});

        // * Check Terminal
        if (typeof(c_terminal) == undefined || c_terminal == '') return _response.success(res, "302", {});

        // * Check Station
        if (typeof(c_station) == undefined || c_station == '') return _response.success(res, "311", {});
        
        // * Check Payment
        let check_payment = await _service.payment(i_payment_type, i_transaction_type);
        if (check_payment.rowCount <= 0) return _response.success(res, "319", {});
        
        // * Generate Header
        var data = {
            c_header_code: await _service.generateHeader(),
            d_header: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            i_transaction_type: i_transaction_type,
            i_payment_type: i_payment_type,
            c_terminal: c_terminal,
            c_login: c_login,
            c_station: c_station,
            m_admin_fee: m_admin_fee,
            m_total: m_total,
            m_total_normal: m_nominal,
            m_fare_per_pax: m_total,
            m_normal_fare_per_pax: m_total,
            m_total_fare: m_total,
            m_total_normal_fare:m_total,
            m_balance: m_balance_before + (m_total - m_admin_fee),
            m_balance_before: m_balance_before,
            i_number_per_pax: 1
        };
        console.log("m_nominal",m_nominal);
	console.log(m_balance,m_balance_before, m_admin_fee, m_total, m_total_normal); 
        let process_generate = await _service.processGenerate(data);
        if (!process_generate) return _response.success(res, "320", {});
        
        if ((check_payment.rows[0].n_payment_type).toLowerCase().trim() == 'cash') return _response.success(res, "00", {n_qris_code: "", c_header_code: process_generate});
        
        // * Generate QRIS
        let qris_code = 'TCASH|' + randomstring.generate({charset: 'alphabetic', length: 20, capitalization: 'uppercase'});
        let generate_qris = moment().format('YYYY-MM-DD HH:mm:ss');
        
        return _response.success(res, "00", {n_qris_code: qris_code, c_header_code: process_generate});
        
    } catch (e) {
        return _response.error(res, e.message);
    }
    
}

module.exports = controller;