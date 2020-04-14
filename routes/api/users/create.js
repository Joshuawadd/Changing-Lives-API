const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const utils = require('../../../utils');
const Joi = require('joi');

//nickname is required
//userid is required
function validate(req) {
    const schema = {
        realName: Joi.string().max(31).required(),
        isAdmin: Joi.number().integer().min(0).max(1).required()
    };
    return Joi.validate(req, schema);
}

//Postman can be used to test post request {"realName": "James"}
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

            function get_hashed_password(plain_text_password) {
                return new Promise((resolve) => {
                    bcrypt.genSalt(10).then((salt) => {
                        bcrypt.hash(plain_text_password, salt).then((result) => {
                            resolve([result, salt])
                        });
                    });
                });
            }

            get_hashed_password(password).then((result) => {

                // Both error handling has not been tested and was the result of a quick brainstorm of potential issues
                if (password == null || password === '') {
                    res.sendStatus(500);
                    return;
                }

                //Check if the result produced is an array that holds the hashed password and the hash salt
                if (!(Array.isArray(result) && result.length === 2)) {
                    res.sendStatus(500);
                    return;
                }

                const hashed_password = result[0];
                const salt = result[1];

                utils.mysql_query(res, 'SELECT username FROM users', [], (results, res) => {
                    var names = [];
                    for (let i = 0; i < results.length; i++) {
                        names.push(results[i].username);
                    }
                    var unique = false;
                    while (!unique) {
                        var username = utils.randomUsername();
                        if (names.indexOf(username) == -1) { //the username is unique
                            unique = true;
                            const queryString = 'INSERT INTO users (real_name, username, password, password_salt, is_admin) VALUES (?,?,?,?,?)';
                            const queryArray = [realName, username, hashed_password, salt, isAdmin];
                            utils.mysql_query(res, queryString, queryArray, (results, res) => {
                                utils.log(userId, utils.actions.CREATE, utils.entities.USER, null, JSON.stringify({"name": username}));
                                res.status(200).send({'password':password, 'username':username});
                            });
                        }
                    }
                });
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;