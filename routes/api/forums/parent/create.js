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
            const parentTitle = req.body.parentTitle;
            const parentComment = req.body.parentComment;

            const queryString = 'INSERT INTO parent_comments (user_id,parent_title,parent_comment) VALUES (?, ?, ?)';

            utils.mysql_query(res, queryString, [userId, parentTitle, parentComment], (results, res) =>{
                //const newData = {parentId: results.insertId, parentTitle: parentTitle, parentComment: parentComment};
                //const newDataLog = JSON.stringify(newData)
                utils.log(userId, utils.actions.CREATE, utils.entities.PARENT, null, JSON.stringify({"name": parentTitle}));
                res.status(201).send(JSON.stringify(results.insertId));
            });

        });
    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});



module.exports = router;