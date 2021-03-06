const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');

function validate(req) {
    const schema = {
        parentId: Joi.number().integer().min(0).max(2147483647).required(),
        creatorId: Joi.number().integer().min(0).max(2147483647).required(),
        parentTitle: Joi.string().max(31).required(),
        parentComment: Joi.string().max(65535).required()
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

    try {
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
            const parentId = req.body.parentId;
            const creatorId = req.body.creatorId;
            const parentTitle = req.body.parentTitle;
            const parentComment = req.body.parentComment;

            utils.mysql_query(res, 'SELECT parent_id FROM parent_comments WHERE parent_id = ?', [parentId], (results, res) => {
                if (results.length === 0) {
                    const queryString = 'INSERT INTO parent_comments (parent_id,user_id,parent_title,parent_comment) VALUES (?, ?, ?, ?)';
                    utils.mysql_query(res, queryString, [parentId, creatorId, parentTitle, parentComment], (results, res) => {
                        utils.log(userId, utils.actions.RESTORE, utils.entities.PARENT, null, JSON.stringify({"name": parentTitle}));
                        res.status(201).send(JSON.stringify(results.insertId));
                    });
                } else {
                    res.status(418).send('Cannot restore: this post already exists!');
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


module.exports = router;