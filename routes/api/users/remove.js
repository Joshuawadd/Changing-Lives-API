const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"user_id": 1}
router.post('/', (req, res) => {

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    if (req.body.user_id !== 'undefined') {
        connection.query('DELETE FROM child_comments WHERE user_id = ', [req.body.user_id], (err) => {
            if (err) throw res.sendStatus(400);
        });
    }

    connection.end();

    return res.sendStatus(200);
});

module.exports = router;