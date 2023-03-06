const service = async (c_login, d_logout, terminal, user, trx) => {
    console.log("[*] Getting t_m_pos : ")

    const login = await trx('ctm.t_d_login').update({
            i_login_status: '3'
        }, ['i_login_status'])
        .where({
            'c_login': c_login,
            'n_username': user.n_username,
            'c_login_before': null,
            'i_login_status': 1
        })

        console.log("sadasz", login)

    if (login.length > 0) {


        const loginInfo = await trx('ctm.t_d_addstock AS tda').first([
            trx.raw('SUM(tda.q_employee_card) AS q_employee_card_total_addstock, SUM(tda.q_master_card) AS q_master_card_total_addstock, SUM(tda.q_tenant_card) AS q_tenant_card_total_addstock'),
            trx.raw(`(SELECT SUM(tda.q_employee_card) - ( SELECT COUNT(*) FROM ecms.t_d_trx_card_replacement WHERE c_login = '${c_login}') - COUNT(*) 
                        FROM ecms.t_d_trx_card_registration_history 
                        WHERE c_login ='${c_login}' 
                        AND i_card_type = 1
                    ) AS q_employee_card_total_now`),
            trx.raw(`(SELECT SUM(tda.q_master_card) - ( SELECT COUNT(*) FROM ecms.t_d_trx_card_replacement WHERE c_login = '${c_login}') - COUNT(*) 
                        FROM ecms.t_d_trx_card_registration_history 
                        WHERE c_login ='${c_login}' 
                        AND i_card_type = 2
                    ) AS q_master_card_total_now`),
            trx.raw(`(SELECT SUM(tda.q_tenant_card) - ( SELECT COUNT(*) FROM ecms.t_d_trx_card_replacement WHERE c_login = '${c_login}') - COUNT(*) 
                        FROM ecms.t_d_trx_card_registration_history 
                        WHERE c_login ='${c_login}' 
                        AND i_card_type = 3
                    ) AS q_tenant_card_total_now`),
        ]).where({
            c_login : c_login
        })
        
        await trx('ctm.t_d_logout').insert({
            c_login: c_login,
            c_station: terminal.c_station,
            n_station: terminal.n_station,
            c_pos: terminal.c_pos,
            n_username: user.n_username,
            e_fullname: user.e_fullname,
            q_employee_card_total_addstock : loginInfo.q_employee_card,
            q_master_card_total_addstock : loginInfo.q_master_card,
            q_tenant_card_total_addstock : loginInfo.q_tenant_card,
            q_employee_card_total_now : loginInfo.q_employee_card_total_now,
            q_master_card_total_now : loginInfo.q_master_card_total_now,
            q_tenant_card_total_now : loginInfo.q_tenant_card_total_now,
            i_login_type: 2,
            d_logout: d_logout,
            // i_login_status: 3,
            c_status: '00',
            c_desc: 'S'
        }, 'c_status')

        return true

    }

    return false

}

module.exports = service;