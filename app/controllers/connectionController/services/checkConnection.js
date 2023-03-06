const db = require('../../../config/database')

const service = async () => {

    const conn = await db.raw("SELECT TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') AS current_time")
    console.log("[*] current : ", conn.rows[0])
    if (!conn) return false

    return conn.rows[0]

}

module.exports = service;