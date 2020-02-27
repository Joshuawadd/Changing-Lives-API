const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');

router.post('/', (req, res) => {
    try{

    function verify() {
        return new Promise((resolve) => {
            resolve(utils.tokenVerify(req.body.token), false); 
        });
    }
    verify().then((userId) => { // should get the userId from token
        if (!userId) { 
            console.log("can't verify with the userld");
            res.sendStatus(403);
            return;
        }
    //console.log(userId);
    const parentTitle = req.body.parentTitle;
    const parentComment = req.body.parentComment;

    const queryString = `INSERT INTO parent_comments (user_id,parent_title,parent_comment) VALUES (?, ?, ?)`;

    utils.mysql_query(res, queryString, [userId, parentTitle, parentComment], (results, res) =>{
        const new_data = {parentId: results.insertId, parentTitle: parentTitle, parentComment: parentComment};
        const new_data_log = JSON.stringify(new_data)
        utils.log(userId, 'create', 'parent', new_data_log);
        res.status(201).send(JSON.stringify(results.insertId))
    })

}
)} catch (err){
    console.log('here');
    res.sendStatus(500)
}
});



module.exports = router;