const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const Joi = require('joi');

//nickname is required
//userid is required
function validate(req) {
    const schema = {
        nickname: Joi.string().max(31).required(), //Check nickname is a string with a max length exists
        userId: Joi.number().integer().min(0).max(2147483647).required() //Check the userId is an integer within a given range exists
    };
    return Joi.validate(req, schema); //Validate the body against the schema, if it is valid, return true, else false
}

//Postman can be used to test post request {"nickname":"James", "userId": 0}
router.post('/', (req, res) => {
// Get the validation response, if it failed, send a bad request status with an error message

    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), true));
            });
        }

        verify().then((editor) => {
            if (!editor) { // get the userId of account who is doing the operation
                res.sendStatus(403);
                return;
            }

            const nickname = req.body.nickname;
            const userId = req.body.userId;
            // update the information in the database
            const queryString = 'UPDATE users SET real_name = ? WHERE user_id = ?';
            const queryArray = [nickname, userId];
            utils.mysql_query(res, queryString, queryArray, (results, res) => {
                // add log information
                utils.log(editor, utils.actions.EDIT, utils.entities.USER, null, JSON.stringify({"name": nickname}));
                res.sendStatus(200);
            });

        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;