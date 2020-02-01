const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"userId": 1, "action":"pick from enum", "dateTime":time} <- make sure the time is converted to a "mysql" time (check google)
router.post('/', (req, res) => {

    const userId = req.body.userId;
    const action = req.body.action;
    const dateTime = req.body.dateTime;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    connection.query('INSERT INTO child_comments (user_id,action,time) VALUES (?,?,?)', [userId, action, dateTime], (err) => {
        if (err) throw res.sendStatus(400);
    });

    connection.end();

    res.sendStatus(200);
});

module.exports = router;