const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"user_id": 1, "section_name": "test", "article_text":"This is a comment"}
router.post('/', (req, res) => {

    const user_id = req.body.user_id;
    const section_name = req.body.section_name;
    const article_text = req.body.article_text;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    connection.query('INSERT INTO sections (user_id,section_name,article_text) VALUES (?,?,?)', [user_id, section_name, article_text], (err) => {
        if (err) throw res.sendStatus(400);
    });

    connection.end();

    return res.sendStatus(200);
});

module.exports = router;