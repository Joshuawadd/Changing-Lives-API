const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mysql = require('mysql');
const Joi = require('joi');
const tv = require('../tokenVerify');
const utils = require('../../../utils');



router.post('/', (req, res) => {

    const {error} = validate(req.body);
    
    if (error) {
        const errorMessage = error.details[0].message
        res.status(400).send(errorMessage);
        return;
    }


    const username = req.body.userName;
    const password = req.body.userPassword;
    const connection = utils.connection;
    

    connection.connect((err) => {
        if (err) {
            console.log(`${err}`);
            res.sendStatus(500)
        } else {
            const passwordMatch = new Promise((resolve) => {
                connection.query('SELOCT password, password_salt, user_id FROM users WHERE username = ?', [username], (err, rows) => {
                    if (err) {
                        console.log(`${err}`);
                        res.sendStatus(500)
                        return
                    }
                    if (rows.length > 0) {
                        const password_salt = rows[0]['password_salt'];
                        const password_hashed = rows[0]['password'];
                        const userId = rows[0]['user_id'];
        
                        const temp_hash = bcrypt.hashSync(password, password_salt);
                        if (temp_hash === password_hashed) {
                            resolve(userId);
                        } else {
                            resolve(undefined)
                        }
                    } else {
                        resolve(undefined);
                    }
                });
            });
    
            passwordMatch.then((userId) => {
                if (typeof(userId) !== 'undefined') {
                    const token = jwt.sign({userId: userId}, process.env.USER_KEY, {expiresIn: 1200});
                    res.status(200).send(token);
                    utils.log(userId, "login", "users")
                } else {
                    res.status(401).send("Incorrect username and/or password");
                }
            }).finally(() => {
                connection.end();
            });
        }
    });
});

//silently logs in if page is refreshed and token is still in date
router.get('/silent', (req, res) => {
    function verify() {
        return new Promise((resolve) => {
            resolve(tv.tokenVerify(req.query.token));
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


function validate(req) {
    const schema = {
        userName: Joi.string().min(1).max(16).required(),
        userPassword: Joi.string().min(1).max(16).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;