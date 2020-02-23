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
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.query.token), true);
            });
        }
        verify().then((result) => {
            if (!result) {
                res.sendStatus(403);
                return;
            }
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
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;