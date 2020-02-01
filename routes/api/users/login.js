const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mysql = require('mysql');
const Joi = require('joi');


router.post('/', (req, res) => {

    const {error} = validate(req.body);

    if (error) {
        return res.sendStatus(500);
    }

    const username = req.body.username;
    const password = req.body.password;

    const token = jwt.sign({uname: username}, process.env.TOKEN_USER, {expiresIn: 1200});

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    function passwordMatch() {
        return new Promise((resolve) => {
            connection.query('SELECT password, password_salt FROM users WHERE username = ?', [username], (err, rows) => {
                const password_salt = rows[0]['password_salt'];
                const password_hashed = rows[0]['password'];

                const temp_hash = bcrypt.hashSync(password, password_salt);
                resolve(temp_hash === password_hashed);
            });
        });
    }

    passwordMatch().then((result) => {
        if (result) {
            return res.status(200).send(token);
        } else {
            return res.sendStatus(400);
        }
    }).finally(() => {
        connection.end();
    });

});

//silently logs in if page is refreshed and token is still in date
router.get('/silent', (req, res) => {
    jwt.verify(req.query.token, process.env.TOKEN_USER, (err) => {
        if (!err) {
            res.sendStatus(200);
        } else {
            res.sendStatus(403);
        }
    });
});


function validate(req) {
    const schema = {
        username: Joi.string().min(1).max(16).required(),
        password: Joi.string().min(1).max(16).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;