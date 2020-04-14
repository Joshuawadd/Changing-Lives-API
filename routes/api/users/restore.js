const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const Joi = require('joi');

//username is 6 (user accounts), 8 (admin accounts)
//passwords are between 6 and 16 digits
//realname is required
function validate(req) {
    const schema = {
        username: Joi.string().min(6).max(8).required(),
        password: Joi.string().min(6).max(16).required(),
        realName: Joi.string().max(31).required(),
        salt: Joi.string().max(32).required(),
        isAdmin: Joi.number().integer().min(0).max(1).required()
    };
    return Joi.validate(req, schema);
}

//Postman can be used to test post request {"realName": "James", "username": "abcd12", "password": "e2Gf...", "salt": "ef4..", "isAdmin": 0 }
router.post('/', (req, res) => {

    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

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