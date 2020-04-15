const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Joi = require('joi');
const utils = require('../../../utils');


//username is 6 (user accounts), 8 (admin accounts)
//passwords are between 6 and 16 digits
function validate(req) {
    const schema = {
        userName: Joi.string().min(6).max(8).required(), //Check the userName is a string within a given range exists
        userPassword: Joi.string().min(6).max(16).required() //Check the userPassword is a string within a given range exists
    };
    return Joi.validate(req, schema);
}

router.post('/', (req, res) => {

    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

    const userName = req.body.userName;
    const password = req.body.userPassword;
    // get the information of the input username from the database
    const queryString = 'SELECT password, password_salt, user_id, is_admin, force_reset FROM users WHERE username = BINARY ?';
    const queryArray = [userName];

    utils.mysql_query(res, queryString, queryArray, (rows, res) => {
        const passwordMatch = new Promise((resolve) => {

            if (rows.length > 0) {
                const password_salt = rows[0]['password_salt'];
                const password_hashed = rows[0]['password'];
                const userId = rows[0]['user_id'];
                const isAdmin = (rows[0]['is_admin']).readUInt8();
                const forceReset = (rows[0]['force_reset']).readUInt8();

                function verify_password(hashed_password, plain_text_password, salt) {
                    return new Promise((resolve) => {
                        bcrypt.hash(plain_text_password, salt).then((result) => {
                            resolve(result === hashed_password);
                        });
                    });
                }

                verify_password(password_hashed, password, password_salt).then((result) => {
                    if (result) {
                        resolve([userId, isAdmin, forceReset]);
                    } else {
                        resolve(undefined);
                    }
                });
            }
        });

        passwordMatch.then((arr) => {
            if (typeof (arr) !== 'undefined') {
                var userId = arr[0];
                var isAdmin = arr[1];
                var forceReset = arr[2];
                var token;
                if (isAdmin) {
                    token = jwt.sign({userId: userId}, process.env.STAFF_KEY, {expiresIn: 1200});
                } else {
                    token = jwt.sign({userId: userId}, process.env.USER_KEY, {expiresIn: 1200});
                }
                res.status(200).send({'token': token, 'id': userId, 'isAdmin': isAdmin, 'forceReset': forceReset});
                utils.log(userId, utils.actions.LOGIN, utils.entities.USER, null, JSON.stringify({"name": userName}));
            } else {
                res.status(401).send('Incorrect username and/or password');
            }
        });
    });
});

//silently logs in if page is refreshed and token is still in date
router.get('/silent', (req, res) => {
    function verify() {
        return new Promise((resolve) => {
            resolve(utils.tokenVerify(req.query.token));
        });
    }

    verify().then((result) => {
        if (!result) {
            res.sendStatus(403);
            return;
        }
        res.sendStatus(200);
    });
});


module.exports = router;