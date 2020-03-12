const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const utils = require('../../../../utils');

router.post('/', (req, res) => {
    try{

        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')), true); 
            });
        }
        verify().then((userId) => { // should get the userId from token
            if (!userId) { 
                res.sendStatus(403);
                return;
            }
            const creatorId = req.body.creatorId;
            const parentId = req.body.parentId;
            const childComment = req.body.childComment;

            const queryString = 'INSERT INTO child_comments (user_id,parent_id,child_comment) VALUES (?,?,?)';

            utils.mysql_query(res, queryString, [creatorId, parentId, childComment], (results, res) =>{
                utils.log(userId, utils.actions.RESTORE, utils.entities.CHILD, null, JSON.stringify({"name": childComment}));
                res.status(201).send(JSON.stringify(results.insertId));
            });
        });
    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;