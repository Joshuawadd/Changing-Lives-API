const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');

//Postman can be used to test post request {"userId": 1, "parent_id": 1, "child_comment":"This is a comment"}
router.post('/', (req, res) => {

    function verify() {
        return new Promise((resolve) => {
            resolve(utils.tokenVerify(req.query.token), true); // cant test with postman because the req.query.token is automatically created
        });
    }
    verify().then((userId) => { // should get the userId from token
        if (!userId) { 
            // res.sendStatus(403);
            userId = 1;
            return;
        }})
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
    utils.log(userId, 'create', 'child');
    res.sendStatus(200);
});

module.exports = router;