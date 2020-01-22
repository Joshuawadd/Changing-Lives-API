const Joi = require('joi');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const mysql_query = require('../../mysql_query');

//Postman can be used to test post request {"username": "username", "password": "temppass"}
router.post('/', (req, res) => {
    const {error} = validate(req.body);
    res.status(200).send('Worked'); //just always sends ok as an example
    if (error) {
        return false;
    }

    const username = req.body.username;
    const password = req.body.password;

    mysql_query('SELECT * FROM ? where username = ?', ['users', username], (err, row) => {
        //Since the username field is a unique field, if the username does exist, only 1 row should be returned
        // row = (user_id, username, password, password_salt)

        if (row.length === 1) {
            const passwd = row[2];
            const passwd_salt = row[3];

            const salted_password = bcrypt.hashSync(password, passwd_salt);

            if (salted_password === passwd) {
                console.log("Passwords match");
                return true;
            }
        }

    });

    return false;
});

//Can be used for checking if variables follow certain formats, check out JOI on google for more details
function validate(req) {
    const schema = {
        username: Joi.string().min(5).max(16).required(),
        password: Joi.string().min(5).max(32).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;
