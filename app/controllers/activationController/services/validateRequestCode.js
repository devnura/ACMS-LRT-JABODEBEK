const service = async (body, trx) => {
    let rows = await trx('ecms.t_m_request_code').where({c_request_code: body.c_unique}).first()
    return rows
}

module.exports = service;