const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');

router.post('/', (req, res) => {
    try{

        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')), false); 
            });
        }
        verify().then((userId) => { // should get the userId from token
            if (!userId) { 
                console.log('can\'t verify with the userId');
                res.sendStatus(403);
                return;
            }
            //console.log(userId);
            const parentId = req.body.parentId;
            const childComment = req.body.childComment;

            const queryString = 'INSERT INTO child_comments (user_id,parent_id,child_comment) VALUES (?,?,?)';

            utils.mysql_query(res, queryString, [userId, parentId, childComment], (results, res) =>{
                //const newData = {childId: results.insertId, childComment: childComment};
                //const newDataLog = JSON.stringify(newData)
                utils.log(userId, utils.actions.CREATE, utils.entities.CHILD, null, JSON.stringify({"name": childComment}));
                res.status(201).send(JSON.stringify(results.insertId));
            });

        });
    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;