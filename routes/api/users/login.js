const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Joi = require('joi');
const utils = require('../../../utils');

function validate(req) {
    const schema = {
        userName: Joi.string().min(1).max(16).required(),
        userPassword: Joi.string().min(1).max(16).required()
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

    const queryString = 'SELECT password, password_salt, user_id, is_admin FROM users WHERE username = ?';
    const queryArray = [userName];
    
    utils.mysql_query(res, queryString, queryArray, (rows, res) => {
        const passwordMatch = new Promise((resolve) => {
            if (rows.length > 0) {
                const password_salt = rows[0]['password_salt'];
                const password_hashed = rows[0]['password'];
                const userId = rows[0]['user_id'];
                const isAdmin = (rows[0]['is_admin']).readUInt8();
                const temp_hash = bcrypt.hashSync(password, password_salt);
                console.log(temp_hash, password_hashed);
                if (temp_hash === password_hashed) {
                    resolve([userId, isAdmin]);
                } else {
                    resolve(undefined);
                }
            } else {
                resolve(undefined);
            }
        });
        
        passwordMatch.then((arr) => {
            console.log(arr);
            if (typeof(arr) !== 'undefined') {
                var userId = arr[0];
                var isAdmin = arr[1];
                var token;
                if (isAdmin) {
                    token = jwt.sign({userId: userId}, process.env.STAFF_KEY, {expiresIn: 1200});
                } else {
                    token = jwt.sign({userId: userId}, process.env.USER_KEY, {expiresIn: 1200});
                }
                res.status(200).send(token);
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