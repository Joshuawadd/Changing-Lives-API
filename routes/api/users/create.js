const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

const functions = require('../../../public/js/functions');

//Postman can be used to test post request {"real_name": "James"}
router.post('/', (req, res) => {
    try {
        const real_name = req.body.real_name;
        const username = functions.randomUsername();
        const password = functions.randomPassword();
        const salt = bcrypt.genSaltSync(10);
        const hashed_pass = bcrypt(password, salt);

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
            [real_name, username, hashed_pass, salt, 0], (err) => {
                if (err) throw res.sendStatus(400);
            });

        connection.end();

        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;