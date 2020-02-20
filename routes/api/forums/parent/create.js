const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"userId": 1, "parentTitle":"Test title number 1", "parentComment":"This is a comment"}
router.post('/', (req, res) => {

    function verify() {
        return new Promise((resolve) => {
            resolve(utils.tokenVerify(req.query.token), true); // cant test with postman because the req.query.token is automatically created
        });
    }
    verify().then((userId) => { // should get the userId from token
        if (!userId) { 
            res.sendStatus(403);
            return;
        }})

    const parentTitle = req.body.parentTitle;
    const parentComment = req.body.parentComment;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    connection.query('INSERT INTO parent_comments (user_id,parent_title,parent_comment) VALUES (?,?,?)', [userId, parentTitle, parentComment], (err) => {
        if (err) throw res.sendStatus(400);
    });

    connection.end();
    utils.log(userId, 'create', 'parent');
    res.sendStatus(200);
});

module.exports = router;