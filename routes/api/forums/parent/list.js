const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');

router.get('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.query.token), false);
            });
        }

        verify().then((userId) => { // should get the userId from token
            if (!userId) {
                console.log('can\'t verify with the userId');
                res.sendStatus(403);
                return;
            }

            // if no search query, set to empty string
            const search = typeof (req.query.search) !== 'undefined' ? req.query.search : '';

            const queryString = `SELECT IF(is_admin = 1, true, false) AS is_admin FROM users WHERE user_id = ?`;
            const queryArray = [userId];

            var isAdmin;
            utils.mysql_query(res, queryString, queryArray, (rows, res) => {
                isAdmin = rows[0].is_admin;
                const nestedQueryArray = [`%${search}%`];
                var nestedQueryString;
                //if (isAdmin) {
                nestedQueryString = `SELECT p.parent_id, p.parent_title, p.parent_comment, u.username FROM parent_comments p INNER JOIN users u ON p.user_id = u.user_id WHERE p.parent_title LIKE ?`;
                //} else {
                //nestedQueryString = `SELECT parent_id, parent_title, parent_comment FROM parent_comments WHERE parent_title LIKE ?`
                //}
                //console.log(nestedQueryString)
                utils.mysql_query(res, nestedQueryString, nestedQueryArray, (rows, res) => {
                    res.status(200).send(rows);
                });


            });

        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;