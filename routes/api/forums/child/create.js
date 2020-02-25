const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');

//Postman can be used to test post request {"userId": 1, "parent_id": 1, "child_comment":"This is a comment"}
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
    const child_comment = req.body.child_comment;

    const queryString = `INSERT INTO child_comments (user_id,parent_id,child_comment) VALUES (${userId}, ${parent_id}, ${child_comment})`;
    
    utils.mysql_query(res, queryString, [], (results, res) =>{
        res.sendStatus(200);
        utils.log(userId, 'create', 'child');
    })

    // utils.log(userId, 'create', 'child');
    // res.sendStatus(200);
}
)});

module.exports = router;