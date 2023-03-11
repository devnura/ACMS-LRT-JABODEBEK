const service = async (body, trx) => {
    
    let rows = await trx('ecms.t_m_request_code').where({c_request_code: body.c_unique}).first()
    if(rows) return false
    
    const result = await trx('ecms.t_m_request_code').insert({c_request_code: body.c_unique}, "c_request_code")
    return true
}

module.exports = service;