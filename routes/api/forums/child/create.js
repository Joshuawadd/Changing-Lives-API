const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"userId": 1, "parent_id": 1, "child_comment":"This is a comment"}
router.post('/', (req, res) => {

    const userId = req.body.userId;
    const parent_id = req.body.parent_id;
    const child_comment = req.body.child_comment;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    connection.query('INSERT INTO child_comments (user_id,parent_id,child_comment) VALUES (?,?,?)', [userId, parent_id, child_comment], (err) => {
        if (err) throw res.sendStatus(400);
    });

    connection.end();

    res.sendStatus(200);
});

module.exports = router;