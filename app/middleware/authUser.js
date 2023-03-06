const { ACCESS_TOKEN_SECRET } = require('../config/secret')
const jwt = require('jsonwebtoken')
const db = require('../config/database')

const middleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || "";
    const token = authHeader && authHeader.split(" ")[1];
    
    if (token == null) return res.status(200).send({ status: '01', message: 'failed', data: { error: 'Unauthorized' } }) //401

    // console.log(req.headers["authorization"])
    jwt.verify(token, ACCESS_TOKEN_SECRET, async(err, user) => {
        //check verifikasi token, termasuk expired
        if (err) return res.status(200).send({ status: '01', message: 'failed', data: { error: err }}) //401
        
        //check issuer code token
        let getUserToken = await db("trx.t_trx_token_third_party").where("third_party_code", req.body.issuer_code || user.username).first();
        if(!getUserToken) return res.status(200).send({ status: '01', message: 'failed', data: { error: 'Issuer Code Unknown' } }) //401

        //Check kebenaran token
        if( getUserToken.token !== token ) return res.status(200).send({ status: '01', message: 'failed', data: { error: 'Token Invalid' } }) //401

        req.user = user

        next();
    })
}

module.exports = middleware;