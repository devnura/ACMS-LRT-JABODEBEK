const service = async (body, trx) => {
    
    let rows = await trx('ctm.t_d_addstock').insert({
        "c_login": body.c_login,
        "c_station": body.c_station,
        "n_station": body.n_station,
        "c_pos": body.c_pos,
        "n_username": body.n_username,
        "e_fullname": body.e_fullname,
        "q_employee_card" : body.q_employee_card, 
        "q_master_card" : body.q_master_card, 
        "q_tenant_card" : body.q_tenant_card, 
        "c_status": body.c_status,
        "c_desc": body.c_desc,
        "c_unique": body.c_unique,
        "d_addstock": body.d_addstock_at
    }, "i_id").onConflict('c_unique')
    .ignore()
    
    return rows
}

module.exports = service;