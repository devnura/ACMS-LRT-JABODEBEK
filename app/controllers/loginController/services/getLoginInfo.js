const service = async (body, trx) => {
    let query = `
 
    select 
        TRIM(t_d_login.c_station) AS c_station,
        t_d_login.n_station,
        TRIM(t_d_login.c_pos) AS c_pos,
        t_d_login.n_username,
        t_d_login.e_fullname,
        TRIM(t_d_login.c_login) AS c_login,
        to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') AS d_login_info_at,
        to_char(t_d_login.d_login, 'YYYY-MM-DD HH24:MI:SS') AS d_openshift_at,
                        
        coalesce (t_d_addstock_init.q_employee_card_init_addstock, 0)::varchar as q_employee_card_init_addstock,
        coalesce (t_d_addstock_init.q_master_card_init_addstock, 0)::varchar as q_master_card_init_addstock,
        coalesce (t_d_addstock_init.q_tenant_card_init_addstock, 0)::varchar as q_tenant_card_init_addstock,

        coalesce (t_d_addstock.q_employee_card_total_addstock, 0) as q_employee_card_total_addstock,
        coalesce (t_d_addstock.q_master_card_total_addstock, 0) as q_master_card_total_addstock,
        coalesce (t_d_addstock.q_tenant_card_total_addstock, 0) as q_tenant_card_total_addstock,
        
        coalesce (q_employee_card_total_addstock - coalesce(q_employee_card_registration, 0) - coalesce(q_employee_card_replacement, 0), 0) as q_employee_card_total_now,
        coalesce (q_master_card_total_addstock - coalesce(q_master_card_registration, 0) - coalesce(q_master_card_replacement, 0), 0) as q_master_card_total_now,
        coalesce (q_tenant_card_total_addstock - coalesce(q_tenant_card_registration, 0) - coalesce(q_tenant_card_replacement, 0), 0) as q_tenant_card_total_now,
        
        coalesce (t_d_trx_employee_card_registration_history.q_employee_card_registration, 0) as q_employee_card_registration,
        coalesce (t_d_trx_master_card_registration_history.q_master_card_registration, 0) as q_master_card_registration,
        coalesce (t_d_trx_tenant_card_registration_history.q_tenant_card_registration, 0) as q_tenant_card_registration,
        
        coalesce (t_d_trx_employee_update_card_expired.q_employee_card_update_expired, 0) as q_employee_card_update_expired,
        coalesce (t_d_trx_master_update_card_expired.q_master_card_update_expired, 0) as q_master_card_update_expired,
        coalesce (t_d_trx_tenant_update_card_expired.q_tenant_card_update_expired, 0) as q_tenant_card_update_expired,
        
        coalesce (t_d_trx_employee_card_replacement.q_employee_card_replacement, 0) as q_employee_card_replacement,
        coalesce (t_d_trx_master_card_replacement.q_master_card_replacement, 0) as q_master_card_replacement,
        coalesce (t_d_trx_tenant_card_replacement.q_tenant_card_replacement, 0) as q_tenant_card_replacement,
        
        coalesce (t_d_trx_employee_card_perso.q_employee_card_perso, 0) as q_employee_card_perso,
        coalesce (t_d_trx_master_card_perso.q_master_card_perso, 0) as q_master_card_perso,
        coalesce (t_d_trx_tenant_card_perso.q_tenant_card_perso, 0) as q_tenant_card_perso


    from
        ctm.t_d_login
        
    left join (
        select
            q_employee_card as q_employee_card_init_addstock,
            q_master_card as q_master_card_init_addstock,
            q_tenant_card as q_tenant_card_init_addstock,
            tda.c_login
        from
            ctm.t_d_addstock tda
        where
            tda.c_login = '${body.c_login}'
        order by tda.d_addstock, i_id asc limit 1
            ) as t_d_addstock_init on
        t_d_addstock_init.c_login = t_d_login.c_login

    left join (
        select
            SUM(q_employee_card) as q_employee_card_total_addstock,
            SUM(q_master_card) as q_master_card_total_addstock,
            SUM(q_tenant_card) as q_tenant_card_total_addstock,
            tda.c_login
        from
            ctm.t_d_addstock tda
        where
            tda.c_login = '${body.c_login}'
        group by
            tda.c_login
            ) as t_d_addstock on
        t_d_addstock.c_login = t_d_login.c_login
        
    left join(
        select
            count(*) as q_employee_card_registration,
            c_login
        from
            ecms.t_d_trx_card_registration_history tdtcrh
        where
            tdtcrh.c_login = '${body.c_login}'
        AND 
            tdtcrh.i_card_type = '1'
        AND
            tdtcrh.c_status = '00'
        group by
            tdtcrh.c_login
    ) as t_d_trx_employee_card_registration_history on
        t_d_trx_employee_card_registration_history.c_login = t_d_login.c_login
        
    left join(
        select
            count(*) as q_master_card_registration,
            c_login
        from
            ecms.t_d_trx_card_registration_history tdtcrh
        where
            tdtcrh.c_login = '${body.c_login}'
        AND 
            tdtcrh.i_card_type = '2'
        AND
            tdtcrh.c_status = '00'
        group by
            tdtcrh.c_login
    ) as t_d_trx_master_card_registration_history on
        t_d_trx_master_card_registration_history.c_login = t_d_login.c_login
        
    left join(
        select
            count(*) as q_tenant_card_registration,
            c_login
        from
            ecms.t_d_trx_card_registration_history tdtcrh
        where
            tdtcrh.c_login = '${body.c_login}'
        AND 
            tdtcrh.i_card_type = '3'
        AND
            tdtcrh.c_status = '00'
        group by
            tdtcrh.c_login
    ) as t_d_trx_tenant_card_registration_history on
        t_d_trx_tenant_card_registration_history.c_login = t_d_login.c_login
        
    left join(
        select
            count(*) as q_employee_card_update_expired,
            c_login
        from
            ecms.t_d_trx_update_card_expired tdtuce
        where
            tdtuce.c_login = '${body.c_login}'
        AND 
            tdtuce.i_card_type = '1'
        AND
            tdtuce.c_status = '00'
        group by
            tdtuce.c_login
    ) as t_d_trx_employee_update_card_expired on
        t_d_trx_employee_update_card_expired.c_login = t_d_login.c_login

    left join(
        select
            count(*) as q_master_card_update_expired,
            c_login
        from
            ecms.t_d_trx_update_card_expired tdtuce
        where
            tdtuce.c_login = '${body.c_login}'
        AND 
            tdtuce.i_card_type = '2'
        AND
            tdtuce.c_status = '00'
        group by
            tdtuce.c_login
    ) as t_d_trx_master_update_card_expired on
        t_d_trx_master_update_card_expired.c_login = t_d_login.c_login

    left join(
        select
            count(*) as q_tenant_card_update_expired,
            c_login
        from
            ecms.t_d_trx_update_card_expired tdtuce
        where
            tdtuce.c_login = '${body.c_login}'
        AND 
            tdtuce.i_card_type = '3'
        AND
            tdtuce.c_status = '00'
        group by
            tdtuce.c_login
    ) as t_d_trx_tenant_update_card_expired on
        t_d_trx_tenant_update_card_expired.c_login = t_d_login.c_login
        
    left join(
        select
            count(*) as q_employee_card_replacement,
            c_login
        from
            ecms.t_d_trx_card_replacement tdtcr
        where
            tdtcr.c_login = '${body.c_login}'
        AND 
            tdtcr.i_card_type = '1'
        AND
            tdtcr.c_status = '00'
        group by
            tdtcr.c_login
    ) as t_d_trx_employee_card_replacement on
        t_d_trx_employee_card_replacement.c_login = t_d_login.c_login

    left join(
        select
            count(*) as q_master_card_replacement,
            c_login
        from
            ecms.t_d_trx_card_replacement tdtcr
        where
            tdtcr.c_login = '${body.c_login}'
        AND 
            tdtcr.i_card_type = '2'
        AND
            tdtcr.c_status = '00'
        group by
            tdtcr.c_login
    ) as t_d_trx_master_card_replacement on
        t_d_trx_master_card_replacement.c_login = t_d_login.c_login

    left join(
        select
            count(*) as q_tenant_card_replacement,
            c_login
        from
            ecms.t_d_trx_card_replacement tdtcr
        where
            tdtcr.c_login = '${body.c_login}'
        AND 
            tdtcr.i_card_type = '3'
        AND
            tdtcr.c_status = '00'
        group by
            tdtcr.c_login
    ) as t_d_trx_tenant_card_replacement on
        t_d_trx_tenant_card_replacement.c_login = t_d_login.c_login

    left join(
        select
            count(*) as q_employee_card_perso,
            c_login
        from
            ecms.t_d_trx_perso tdtp
        where
            tdtp.c_login = '${body.c_login}'
        AND 
            tdtp.i_card_type = '1'
        group by
            tdtp.c_login
    ) as t_d_trx_employee_card_perso on
        t_d_trx_employee_card_perso.c_login = t_d_login.c_login

    left join(
        select
            count(*) as q_master_card_perso,
            c_login
        from
            ecms.t_d_trx_perso tdtp
        where
            tdtp.c_login = '${body.c_login}'
        AND 
            tdtp.i_card_type = '2'
        group by
            tdtp.c_login
    ) as t_d_trx_master_card_perso on
        t_d_trx_master_card_perso.c_login = t_d_login.c_login

    left join(
        select
            count(*) as q_tenant_card_perso,
            c_login
        from
            ecms.t_d_trx_perso tdtp
        where
            tdtp.c_login = '${body.c_login}'
        AND 
            tdtp.i_card_type = '3'
        group by
            tdtp.c_login
    ) as t_d_trx_tenant_card_perso on
        t_d_trx_tenant_card_perso.c_login = t_d_login.c_login
        
    where
        t_d_login.c_login = '${body.c_login}'
        AND t_d_login.c_login_before IS NUll
        AND t_d_login.c_login NOT IN (SELECT t_d_logout.c_login FROM ctm.t_d_logout where t_d_logout.c_login = '${body.c_login}')
        
    group by
        1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29

    `

    const loginInfo = await trx.raw(query)

    return loginInfo.rows[0]

}

module.exports = service;