const express = require('express');
const router = express.Router();
const utils = require('../../../utils');

class User {
    constructor(id = 0, name = '', username = '', password = '') {
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
    }
}

router.get('/', (req, res) => {
    try {
        const search = req.query.search;
        const userName = req.query.uname;
        const userRealName = req.query.rname;
        let uSrch = '%';
        let rnSrch = '%';
        let andOr = '-';
        if (userName === 'true') {
            uSrch = '%' + search + '%';
            andOr = '*';
        }
        if (userRealName === 'true') {
            rnSrch = '%' + search + '%';
            if (andOr === '*') {
                andOr = 'OR';
            }
        }
        if (andOr != 'OR') {
            andOr = 'AND';
        }
        function verify(admin) {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.query.token, admin));
            });
        }
        verify(true).then((result) => {
            if (!result) {
                verify(false).then((result2) => {
                    if (!result2) {
                        res.sendStatus(403);
                        return;
                    }
                    const queryString = `SELECT user_id, username FROM users WHERE real_name LIKE ? ${andOr} username LIKE ?`;
                    const queryArray = [rnSrch, uSrch];
                    utils.mysql_query(res, queryString, queryArray, (results, res) => {
                        let userData = results;
                        let users = [];
                        for (let i = 0; i < userData.length; i++) {
                            users.push(new User(userData[i].user_id, null, userData[i].username, null));
                        }
                        res.status(200).send(users);
                        return;
                    });
                });
            } else {
                const queryString = `SELECT user_id, real_name, username, password FROM users WHERE real_name LIKE ? ${andOr} username LIKE ?`;
                const queryArray = [rnSrch, uSrch];
                utils.mysql_query(res, queryString, queryArray, (results, res) => {
                    let userData = results;
                    let users = [];
                    for (let i = 0; i < userData.length; i++) {
                        users.push(new User(userData[i].user_id, userData[i].real_name, userData[i].username, userData[i].password));
                    }
                    res.status(200).send(users);
                });
            }
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;