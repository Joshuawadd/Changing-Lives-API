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
    console.log(userId);
    const parent_id = req.body.parent_id;
    const child_comment = req.body.child_comment;

    const queryString = `INSERT INTO child_comments (user_id,parent_id,child_comment) VALUES (?,?,?)`;

    
    const new_data = {"child_comment": child_comment};
    const new_data_log = JSON.stringify(new_data)
    utils.mysql_query(res, queryString, [userId, parent_id, child_comment], (results, res) =>{
        utils.log(userId, 'create', 'child', new_data_log);
    })

    const queryString1 = `SELECT child_id FROM child_comments WHERE child_comment = ?`
    utils.mysql_query(res, queryString1, [child_comment], (results, res) =>{

        const childid = results[0]['child_id']
        res.send(JSON.stringify(childid));
    })


}
)} catch (err){
    res.sendStatus(500)
}
});

module.exports = router;