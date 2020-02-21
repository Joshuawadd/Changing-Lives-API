const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');

router.get('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.query.token), true);
            });
        }
        verify().then((userId) => {
            if (!userId) {
                res.sendStatus(403);
                return;
            }

            const search = req.query.search;

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
                    connection.query(`SELECT IF(is_admin = 1, true, false) AS is_admin FROM users WHERE user_id = ${userId}`, [], (err, admin) => {
                        if (err) throw res.sendStatus(400);
                        if(admin[0].is_admin) {
                            connection.query(`SELECT p.parent_id, p.parent_title, p.parent_comment, u.username FROM parent_comments p INNER JOIN users u ON p.user_id = u.user_id WHERE p.parent_title LIKE '%${search}%'`, [], (err, results) => {
                                if (err) throw res.sendStatus(400);
                                resolve(results);
                            });
                        } else {
                            connection.query(`SELECT parent_id, parent_title, parent_comment FROM parent_comments WHERE parent_title LIKE '%${search}%'`, [], (err, results) => {
                                if (err) throw res.sendStatus(400);
                                resolve(results);
                            });
                        }
                    });
                });
            }

            getList().then(result => {
                res.status(200).send(result);
                utils.log(userId, 'list', 'parent');
            }).finally(() => {
                connection.end();
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;