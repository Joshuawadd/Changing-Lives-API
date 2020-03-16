const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const utils = require('../../../utils');

//Postman can be used to test post request {"realName": "James"}
router.post('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), true));
            });
        }
        verify().then((userId) => {
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const realName = req.body.realName;
            const isAdmin = parseInt(req.body.isAdmin);
            const password = utils.randomPassword();
            const salt = bcrypt.genSaltSync(10);
            const hashed_pass = bcrypt.hashSync(password, salt);
            //make sure to generate a unique username
            utils.mysql_query(res, 'SELECT username FROM users', [], (results, res) => {
                var names = [];
                for (let i = 0; i < results.length; i++) {
                    names.push(results[i].username);
                }
                var unique = false;
                while(!unique) {
                    var username = utils.randomUsername();
                    if (names.indexOf(username) == -1) { //the username is unique
                        unique = true;
                        const queryString = 'INSERT INTO users (real_name, username, password, password_salt, is_admin) VALUES (?,?,?,?,?)';
                        const queryArray = [realName, username, hashed_pass, salt, isAdmin];
                        utils.mysql_query(res, queryString, queryArray, (results, res) => {utils.log(userId, utils.actions.CREATE, utils.entities.USER, null, JSON.stringify({"name": username}));res.status(200).send({'password':password, 'username':username});});
                    } 
                }
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;