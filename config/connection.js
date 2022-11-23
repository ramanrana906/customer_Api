const mysql = require('mysql2');

 var con = mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    password:"@Ram88940",
    database:"customer-schema"
})

module.exports = con;