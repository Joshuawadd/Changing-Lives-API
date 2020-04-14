const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');

function validate(req) {
    const schema = {
        parentId: Joi.number().integer().min(0).max(2147483647).required(),
        childComment: Joi.string().max(65535).required()
    };
    return Joi.validate(req, schema);
}

router.post('/', (req, res) => {

    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

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