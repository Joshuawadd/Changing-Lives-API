const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"real_name": "bod bod, "username": "abcd12", "password":"12345", "password_salt":"salt", "is_admin":0}
router.post('/', (req, res) => {

    const real_name = req.body.real_name;
    const username = req.body.username;
    const password = req.body.password;
    const salt = req.body.password_salt;
    const is_admin = req.body.is_admin;


    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    connection.query('INSERT INTO users (real_name, username, password, password_salt, is_admin) VALUES (?,?,?,?,?)',
        [real_name, username, password, salt, is_admin], (err) => {
            if (err) throw res.sendStatus(400);
        });

    connection.end();

    return res.sendStatus(200);
});

module.exports = router;