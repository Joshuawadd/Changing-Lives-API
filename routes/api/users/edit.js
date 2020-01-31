const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const upload = multer();

//Postman can be used to test post request {"real_name":"James", "user_name":"abcd12", "user_password":"abcdefg", "user_id": 0}
router.post('/', upload.none(), (req, res) => {
    try {
        jwt.verify(req.header('Authorisation'), process.env.TOKEN_USER, (err) => {

            if (err) return res.sendStatus(403);

            const real_name = req.body.real_name;
            const user_name = req.body.user_name;
            const user_pass = req.body.user_password;
            const user_id = req.body.user_id;

            const connection = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });

            connection.connect((err) => {
                if (err) throw err;
            });
            connection.query('UPDATE users SET real_name = ?, username = ?, password = ? WHERE user_id = ?', [real_name, user_name, user_pass, user_id], (err) => {
                if (err) throw res.sendStatus(400);
            });

            connection.end();

            return res.status(200);
        });
    } catch (err) {
        return res.status(500);
    }
});

module.exports = router;