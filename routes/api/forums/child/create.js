const express = require('express');
const router = express.Router();
const utils = require('../../../../utils');
const Joi = require('joi');

// A function to take a web request response's body and check it contains the required arguments
function validate(req) {
    const schema = {
        parentId: Joi.number().integer().min(0).max(2147483647).required(), //Check the parentId is an integer within a given range exists
        childComment: Joi.string().max(65535).required() //Check childComment is a string with a max length exists
    };
    return Joi.validate(req, schema); //Validate the body against the schema, if it is valid, return true, else false
}

router.post('/', (req, res) => {

    // Get the validation response, if it failed, send a bad request status with an error message
    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

    try {

        //Take a user's token and verify they have access for this action
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')), false);
            });
        }

        //Verify the token
        verify().then((userId) => { // should get the userId from token

            //Given token gave a bad userId meaning the user did not have the permission
            if (!userId) {
                console.log('can\'t verify with the userId');
                res.sendStatus(403);
                return;
            }

            const parentId = req.body.parentId;
            //SQL query to insert the new comment into the databse
            const childCommentRaw = req.body.childComment;
            const childComment = utils.profanityFilter(childCommentRaw);
            const queryString = 'INSERT INTO child_comments (user_id,parent_id,child_comment) VALUES (?,?,?)';

            // Using out query unit, pass query string and the data to pass into the query string
            utils.mysql_query(res, queryString, [userId, parentId, childComment], (results, res) => {

                //Log the users attempt at this action whether it failed or was successful
                utils.log(userId, utils.actions.CREATE, utils.entities.CHILD, null, JSON.stringify({"name": childComment}));

                //Return a success status with the result
                res.status(201).send(JSON.stringify(results.insertId));
            });

        });

        //Something failed, handle it and return internal error occured
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;