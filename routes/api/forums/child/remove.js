const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');

//Similar documentation noted in routes/forums/child/create
function validate(req) {
    const schema = {
        childId: Joi.number().integer().min(0).max(2147483647).required()
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
        const childId = req.body.childId;

        //Similar documentation noted in routes/forums/child/create
        function verify(admin) {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), admin));
            });
        }

        verify(true).then((removerStaff) => {
            //If the remover is not an admin
            if (!removerStaff) {
                verify(false).then((removerUser) => {
                    if (!removerUser) {
                        res.sendStatus(403);
                        return;
                    }
                    //if a normal user attempts this, only allow deletion of created comments
                    if (!isNaN(childId)) {

                        //Similar documentation noted in routes/forums/child/create
                        const queryString = 'DELETE FROM child_comments WHERE child_id = ?';
                        const queryArray = [childId];
                        utils.mysql_query(res, 'SELECT * FROM child_comments WHERE child_id = ?', [childId], (results, res) => {
                            if (results.length > 0) {

                                //If the comment belongs to the user
                                if (results[0].user_id === removerUser) {

                                    //Attempt to remove the comment
                                    utils.mysql_query(res, 'SELECT username FROM users WHERE user_id = ?', [results[0].user_id], (userL, res) => {
                                        let commentRemove = JSON.stringify({
                                            "id": results[0].child_id,
                                            "parentId": results[0].parent_id,
                                            "name": results[0].child_comment,
                                            "userId": results[0].user_id,
                                            "creator": userL[0].username
                                        });

                                        //Log the action
                                        utils.mysql_query(res, queryString, queryArray, (results, res) => {
                                            if (results.length > 0) {
                                                utils.log(removerUser, utils.actions.REMOVE, utils.entities.CHILD, null, commentRemove);
                                            }
                                            res.sendStatus(200);
                                        });
                                    });
                                } else {
                                    res.sendStatus(403);
                                }
                            } else {
                                res.sendStatus(400);
                            }
                        });
                    } else {
                        res.sendStatus(400);
                    }
                });
            } else {
                //if a staff user attempts this, allow deletion of any comment
                if (!isNaN(childId)) {

                    //Similar documentation noted in routes/forums/child/create
                    const queryString = 'DELETE FROM child_comments WHERE child_id = ?';
                    const queryArray = [childId];
                    utils.mysql_query(res, 'SELECT * FROM child_comments WHERE child_id = ?', [childId], (results, res) => {
                        if (results.length > 0) {

                            //Attempt to remove the comment
                            utils.mysql_query(res, 'SELECT username FROM users WHERE user_id = ?', [results[0].user_id], (userL, res) => {
                                let commentRemove = JSON.stringify({
                                    "id": results[0].child_id,
                                    "parentId": results[0].parent_id,
                                    "name": results[0].child_comment,
                                    "userId": results[0].user_id,
                                    "creator": userL[0].username
                                });

                                // Log the action
                                utils.mysql_query(res, queryString, queryArray, (results, res) => {
                                    utils.log(removerStaff, utils.actions.REMOVE, utils.entities.CHILD, null, commentRemove);
                                    res.sendStatus(200);
                                });
                            });
                        } else {
                            res.sendStatus(400);
                        }
                    });
                } else {
                    res.sendStatus(400);
                }
            }

        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;