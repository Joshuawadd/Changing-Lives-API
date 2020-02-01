const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"user_id": 1, "parent_title":"Test title number 1", "parent_comment":"This is a comment"}
router.post('/', (req, res) => {

    const user_id = req.body.user_id;
    const parent_title = req.body.parent_title;
    const parent_comment = req.body.parent_comment;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    connection.query('INSERT INTO parent_comments (user_id,parent_title,parent_comment) VALUES (?,?,?)', [user_id, parent_title, parent_comment], (err) => {
        if (err) throw res.sendStatus(400);
    });

    connection.end();

    res.sendStatus(200);
});

module.exports = router;