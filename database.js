// Creates a connection to mysql database and returns it so as to be consumed later on when making requests
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost', // Replace with your host name
    user: 'root',      // Replace with your database username
    password: 'root',      // Replace with your database password
    database: 'forms'
});

conn.connect(function (err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});
module.exports = conn;