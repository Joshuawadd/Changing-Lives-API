const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"user_id": 1}
router.post('/', (req, res) => {
    const uid = req.body.userId || -1;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    if (uid >= 0) {
        connection.query('DELETE FROM users WHERE user_id = ?', [uid], (err) => {
            if (err) throw res.sendStatus(400);
        });
    }

    connection.end();

    res.sendStatus(200);
});

module.exports = router;