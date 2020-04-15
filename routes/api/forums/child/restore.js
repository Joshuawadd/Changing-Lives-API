const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');


//Similar documentation noted in routes/forums/child/create
function validate(req) {
    const schema = {
        creatorId: Joi.number().integer().min(0).max(2147483647).required(),
        parentId: Joi.number().integer().min(0).max(2147483647).required(),
        childComment: Joi.max(65535).required()
    };
    return Joi.validate(req, schema);
}

router.post('/', (req, res) => {

    //Similar documentation noted in routes/forums/child/create
    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

    try {

        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')), true);
            });
        }

        //Similar documentation noted in routes/forums/child/create
        verify().then((userId) => { // should get the userId from token
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const creatorId = req.body.creatorId;
            const parentId = req.body.parentId;
            const childComment = req.body.childComment;

            const queryString = 'INSERT INTO child_comments (user_id,parent_id,child_comment) VALUES (?,?,?)';

            utils.mysql_query(res, queryString, [creatorId, parentId, childComment], (results, res) => {

                //Log the action
                utils.log(userId, utils.actions.RESTORE, utils.entities.CHILD, null, JSON.stringify({"name": childComment}));

                //Return success
                res.status(201).send(JSON.stringify(results.insertId));
            });
        });

        //Internal error occured
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;