const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');

function validate(req) {
    const schema = {
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
            
            const parentTitle = req.body.parentTitle;
            const parentComment = req.body.parentComment;

            const queryString = 'INSERT INTO parent_comments (user_id,parent_title,parent_comment) VALUES (?, ?, ?)';

            utils.mysql_query(res, queryString, [userId, parentTitle, parentComment], (results, res) => {
                utils.log(userId, utils.actions.CREATE, utils.entities.PARENT, null, JSON.stringify({"name": parentTitle}));
                res.status(201).send(JSON.stringify(results.insertId));
            });

        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


module.exports = router;