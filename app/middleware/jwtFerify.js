/* 
 ;==========================================
 ; Title    : JWT Ferify
 ; Author   : Devnura
 ; Date     : 2023-03-11
 ;==========================================
*/

const {
    ACCESS_TOKEN_SECRET
} = require('../config/secret')
const jwt = require('jsonwebtoken')

const middleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || null;
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.status(200).send({
        status: '01',
        message: 'Unauthorized',
        data: {}
    }) //401

    // console.log(req.headers["authorization"])
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        //check verifikasi token, termasuk expired
        if(err || !user){
            return res.status(200).send({
                status: '96',
                message: "Sesi tidak valid, Silahkan melakukan login ulang",
                data: {}
            })
        }

        req.c_login = user.c_login
        req.n_user = user.n_user
        req.c_pos = user.c_pos
        req.d_login = user.d_login

        next();
    })
}

module.exports = middleware;