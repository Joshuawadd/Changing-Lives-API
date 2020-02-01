const express = require('express');
const router = express.Router();
const mysql = require('mysql');

router.get('/', (req, res) => {

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    function getList(){
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM child_comments', [], (err, results) => {
                if (err) throw res.sendStatus(400);
                resolve(results);
            });
        });
    }

    getList().then(result => {
        res.send(result);
    }).finally(() => {
        connection.end();
    });
});

module.exports = router;