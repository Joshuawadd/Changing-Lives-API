const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');
//Postman can be used to test post request {"userId": 1, "parentTitle":"Test title number 1", "parentComment":"This is a comment"}
// router.post('/', (req, res) => {

//     function verify() {
//         return new Promise((resolve) => {
//             resolve(utils.tokenVerify(req.query.token), true); // cant test with postman because the req.query.token is automatically created
//         });
//     }
//     verify().then((userId) => { // should get the userId from token
//         if (!userId) { 
//             res.sendStatus(403);
//             return;
//         }})

//     const parentTitle = req.body.parentTitle;
//     const parentComment = req.body.parentComment;

//     const connection = mysql.createConnection({
//         host: process.env.MYSQL_HOST,
//         user: process.env.MYSQL_USER,
//         password: process.env.MYSQL_PASSWORD,
//         database: process.env.MYSQL_DATABASE
//     });

//     connection.connect((err) => {
//         if (err) throw err;
//     });

//     connection.query('INSERT INTO parent_comments (user_id,parent_title,parent_comment) VALUES (?,?,?)', [userId, parentTitle, parentComment], (err) => {
//         if (err) throw res.sendStatus(400);
//     });

//     connection.end();
//     utils.log(userId, 'create', 'parent');
//     res.sendStatus(200);
// });

router.post('/', (req, res) => {

    function verify() {
        return new Promise((resolve) => {
            resolve(utils.tokenVerify(req.body.token), false); // cant test with postman because the req.query.token is automatically created
        });
    }
    verify().then((userId) => { // should get the userId from token
        if (!userId) { 
            console.log("can't verify with the userld");
            res.sendStatus(403);
            return;
        }
    console.log(userId);
    const parent_id = req.body.parent_id;
    const parent_comment = req.body.parent_comment;

    const queryString = `INSERT INTO parent_comments (user_id,parent_id,parent_comment) VALUES (${userId}, ${parent_id}, ${parent_comment})`;
    
    utils.mysql_query(res, queryString, [], (results, res) =>{
        res.sendStatus(200);
        utils.log(userId, 'create', 'parent');
    })

}
)});



module.exports = router;