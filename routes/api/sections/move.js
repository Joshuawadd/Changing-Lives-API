const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

//Postman can be used to test post request {"section_id": 1} or {"user_id": 1}
router.post('/', (req, res) => {
    try {
        jwt.verify(req.header('Authorisation'), process.env.TOKEN_USER, (err) => {
            if (err) {
                res.sendStatus(403);
                return;
            }
            const connection = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });

            let sec_id = req.body.section_id || '';
            let usr_id = req.body.uer_id || '';

            connection.connect((err) => {
                if (err) throw err;
            });

            if (sec_id !== '') {
                connection.query('DELETE FROM sections WHERE section_id = ?', [sec_id], (err) => {
                    if (err) throw res.sendStatus(400);
                });
                connection.query('DELETE FROM files WHERE section_id = ?', [sec_id], (err) => {
                    if (err) throw res.sendStatus(400);
                });

            } else if (usr_id !== '') {
                connection.query('DELETE FROM sections WHERE user_id = ?', [usr_id], (err) => {
                    if (err) throw res.sendStatus(400);
                });
                connection.query('DELETE FROM files WHERE user_id = ?', [usr_id], (err) => {
                    if (err) throw res.sendStatus(400);
                });
            }

            connection.end();

            res.sendStatus(200);
        });

    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;