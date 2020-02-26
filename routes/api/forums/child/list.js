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

            function getChildRole(results){
                for (var child of results) {
                    if (child.is_admin == 1 && child.is_creator == 1) {
                        child.childRole = 'staffcreator';
                    } else if (child.is_admin == 1) {
                        child.childRole = 'staff';
                    } else if (child.is_creator == 1) {
                        child.childRole = 'creator';
                    } else {
                        child.childRole = 'user';
                    }
                    delete child.is_admin;
                    delete child.is_creator;
                }
            }

            function getList(){
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT IF(is_admin = 1, true, false) AS is_admin FROM users WHERE user_id = ${userId}`, [], (err, admin) => {
                        if (err) throw res.sendStatus(400);
                        if(admin[0].is_admin) {
                            connection.query(`SELECT c.child_id, c.child_comment, u.username, IF(u.is_admin = 1, true, false) AS is_admin, IF(p.user_id = c.user_id, true, false) AS is_creator FROM child_comments c INNER JOIN users u ON c.user_id = u.user_id INNER JOIN parent_comments p ON c.parent_id = p.parent_id  WHERE c.parent_id = ${parentId}`, [], (err, results) => {
                                if (err) throw res.sendStatus(400);
                                getChildRole(results);
                                resolve(results);
                            });
                        } else {
                            connection.query(`SELECT c.child_id, c.child_comment, IF(u.is_admin = 1, true, false) AS is_admin, IF(p.user_id = c.user_id, true, false) AS is_creator FROM child_comments c INNER JOIN users u ON c.user_id = u.user_id INNER JOIN parent_comments p ON c.parent_id = p.parent_id  WHERE c.parent_id = ${parentId}`, [], (err, results) => {
                                if (err) throw res.sendStatus(400);
                                getChildRole(results);
                                resolve(results);
                            });
                        }
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