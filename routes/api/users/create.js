const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const utils = require('../../../utils');

//Postman can be used to test post request {"realName": "James"}
router.post('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')));
            });
        }
        verify().then((result) => {
            if (!result) {
                res.sendStatus(403);
                return;
            }
            const realName = req.body.realName;
            const isAdmin = req.body.isAdmin;
            const username = utils.randomUsername();
            const password = utils.randomPassword();
            const salt = bcrypt.genSaltSync(10);
            const hashed_pass = bcrypt.hashSync(password, salt);

            const queryString = 'INSERT INTO users (real_name, username, password, password_salt, is_admin) VALUES (?,?,?,?,?)';
            const queryArray = [realName, username, hashed_pass, salt, isAdmin];
            utils.mysql_query(res, queryString, queryArray, (results, res) => {});

            res.sendStatus(200);
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;