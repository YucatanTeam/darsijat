const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit : process.env.DB_POOL_MAX,
    host     : process.env.DB_HOST,
    database : process.env.DB_NAME,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    insecureAuth: true
});

console.log(`created connection pool to ${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}`)

module.exports = pool;
