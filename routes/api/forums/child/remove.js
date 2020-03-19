const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');

function validate(req) {
    const schema = {
        childId: Joi.number().integer().min(0).max(2147483647).required()
    };
    return Joi.validate(req, schema);
}

//Postman can be used to test post request {"childId": 1}
router.post('/', (req, res) => {

    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

    try {
        const childId = req.body.childId;
        //const parentId = req.body.parentId;

        function verify(admin) {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), admin));
            });
        }
        verify(true).then((removerStaff) => {
            if (!removerStaff) {
                verify(false).then((removerUser) => {
                    if (!removerUser) {
                        res.sendStatus(403);
                        return;
                    }
                    //if a normal user attempts this, only allow deletion of created comments
                    if (!isNaN(childId)) {
                        const queryString = 'DELETE FROM child_comments WHERE child_id = ?';
                        const queryArray = [childId];
                        utils.mysql_query(res,'SELECT * FROM child_comments WHERE child_id = ?',[childId], (results, res) => {
                            if (results.length > 0) {
                                if (results[0].user_id === removerUser) {
                                    utils.mysql_query(res,'SELECT username FROM users WHERE user_id = ?',[results[0].user_id], (userL, res) => {
                                        let commentRemove = JSON.stringify({"id": results[0].child_id, "parentId": results[0].parent_id, "name": results[0].child_comment, "userId": results[0].user_id, "creator": userL[0].username});
                                        utils.mysql_query(res, queryString, queryArray, (results, res) => {
                                            if (results.length > 0) {
                                                utils.log(removerUser, utils.actions.REMOVE, utils.entities.CHILD, null, commentRemove);
                                            }
                                            res.sendStatus(200);
                                            return;
                                        });
                                    });
                                } else {
                                    res.sendStatus(403);
                                    return;
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
                    const queryString = 'DELETE FROM child_comments WHERE child_id = ?';
                    const queryArray = [childId];
                    utils.mysql_query(res,'SELECT * FROM child_comments WHERE child_id = ?',[childId], (results, res) => {
                        if (results.length > 0) {
                            utils.mysql_query(res,'SELECT username FROM users WHERE user_id = ?',[results[0].user_id], (userL, res) => {
                                let commentRemove = JSON.stringify({"id": results[0].child_id, "parentId": results[0].parent_id, "name": results[0].child_comment, "userId": results[0].user_id, "creator": userL[0].username});
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