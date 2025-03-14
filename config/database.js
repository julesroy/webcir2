const mysql = require('mysql2');

const mysqlConnect = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

mysqlConnect.connect((err) => {
    if (err) {
        console.error('Error mysqlConnect :', err);
    } else {
        console.log('mysqlConnect established');
    }
});

module.exports = mysqlConnect;
