const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"parentId": 1}
router.post('/', (req, res) => {

    const id = req.body.parentId;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    if (req.body.parentId !== 'undefined') {
        connection.query('DELETE FROM parent_comments WHERE parent_id = ', [req.body.parentId], (err) => {
            if (err) throw res.sendStatus(400);
        });
    }

    connection.end();

    res.sendStatus(200);
});

module.exports = router;