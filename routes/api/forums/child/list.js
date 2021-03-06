const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');

//Similar documentation noted in routes/forums/child/create
function validate(req) {
    const schema = {
        parentId: Joi.number().integer().min(0).max(2147483647).required(),
        token: Joi.optional()
    };
    return Joi.validate(req, schema);
}

//Take a users result and mark them as a specific type of job in regards to who created the parent forum
function getChildRole(results) {
    for (var child of results) {
        if (child.is_admin === 1 && child.is_creator === 1) {
            child.childRole = 'staffcreator';
        } else if (child.is_admin === 1) {
            child.childRole = 'staff';
        } else if (child.is_creator === 1) {
            child.childRole = 'creator';
        } else {
            child.childRole = 'user';
        }
        delete child.is_admin;
        delete child.is_creator;
    }
}

router.get('/', (req, res) => {

    //Similar documentation noted in routes/forums/child/create
    const {error} = validate(req.query);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }


    try {
        //Similar documentation noted in routes/forums/child/create
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.query.token), false);
            });
        }

        //Similar documentation noted in routes/forums/child/create
        verify().then((userId) => { // should get the userId from token
            if (!userId) {
                console.log('can\'t verify with the userId');
                res.sendStatus(403);
                return;
            }

            const parentId = req.query.parentId;

            if (typeof (parentId) === 'undefined') {
                res.status(400).send('Bad request: missing parentId');
                return;
            }

            //Similar documentation noted in routes/forums/child/create
            const queryString = `SELECT IF(is_admin = 1, true, false) AS is_admin FROM users WHERE user_id = ?`;
            const queryArray = [userId];

            utils.mysql_query(res, queryString, queryArray, (rows, res) => {
                isAdmin = rows[0].is_admin;
                const nestedQueryArray = [parentId];
                var nestedQueryString = `SELECT c.child_id, c.child_comment, u.username, IF(u.is_admin = 1, true, false) AS is_admin, IF(p.user_id = c.user_id, true, false) AS is_creator FROM child_comments c INNER JOIN users u ON c.user_id = u.user_id INNER JOIN parent_comments p ON c.parent_id = p.parent_id  WHERE c.parent_id = ?`;

                utils.mysql_query(res, nestedQueryString, nestedQueryArray, (rows, res) => {
                    //Take each user and assign them to their correct roles and return a success status with the users and their roles
                    getChildRole(rows);
                    res.status(200).send(rows);
                })
            })

        });

        //An internal error occurred trying to process the request
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;