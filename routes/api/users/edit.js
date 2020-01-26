const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const multer  = require('multer');
var upload = multer();

router.post('/', upload.none(), (req, res) => {
    try {
        var token = req.header('Authorisation');
        jwt.verify(token, 'userToken', function(err, decoded){
            if(!err){
                const user_name = req.body.userName;
                const user_uname = req.body.userUname;
                const user_pass = req.body.userPass;
                const userId = req.body.userId;
                const connection = mysql.createConnection({
                    host: process.env.MYSQL_HOST,
                    user: process.env.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD,
                    database: process.env.MYSQL_DATABASE
                });

                connection.connect((err) => {
                    if (err) throw err;
                });
                connection.query('UPDATE users SET real_name = ?, username = ?, password = ? WHERE user_id = ?', [user_name, user_uname, user_pass, userId], (err, results) => {
                    if (err) throw res.sendStatus(400);
                });
                res.status(200).send('OK');
                connection.end();
            } else {
                res.status(403).send(err);
            }
        });
    } catch(err) {
        res.status(500).send(err);
        return false;
    }
});

module.exports = router;