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

            const parentId = req.query.parent;

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
                    connection.query(`SELECT c.child_id, c.child_comment, u.username FROM child_comments c INNER JOIN users u ON c.user_id = u.user_id WHERE c.parent_id = ${parentId}`, [], (err, results) => {
                        if (err) throw res.sendStatus(400);
                        resolve(results);
                    });
                });
            }

            getList().then(result => {
                res.status(200).send(result);
                utils.log(userId, 'list', 'child');
            }).finally(() => {
                connection.end();
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;