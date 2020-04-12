const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const utils = require('../../../utils');

//Postman can be used to test post request {"realName": "James", "username": "abcd12", "password": "e2Gf...", "salt": "ef4..", "isAdmin": 0 }
router.post('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')), true);
            });
        }

        verify().then((userId) => {
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const realName = req.body.realName;
            const username = req.body.username;
            const password = req.body.password;
            const salt = req.body.salt;
            const isAdmin = parseInt(req.body.isAdmin);
            //make sure username is still unique
            utils.mysql_query(res, 'SELECT username FROM users', [], (results, res) => {
                var names = [];
                for (let i = 0; i < results.length; i++) {
                    names.push(results[i].username);
                }
                if (names.indexOf(username) === -1) { //the username is unique
                    const queryString = 'INSERT INTO users (real_name, username, password, password_salt, is_admin) VALUES (?,?,?,?,?)';
                    const queryArray = [realName, username, password, salt, isAdmin];
                    utils.mysql_query(res, queryString, queryArray, (results, res) => {
                        utils.log(userId, utils.actions.RESTORE, utils.entities.USER, null, JSON.stringify({"name": username}));
                        res.status(200).send(password);
                    });
                } else {
                    res.status(500).send('Cannot restore user. The username taken by another user.');
                }
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;