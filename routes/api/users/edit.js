const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const Joi = require('joi');

//nickname is required
//userid is required
function validate(req) {
    const schema = {
        nickname: Joi.required(),
        userId: Joi.required()
    };
    return Joi.validate(req, schema);
}

//Postman can be used to test post request {"nickname":"James", "userId": 0}
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
                resolve(utils.tokenVerify(req.header('Authorization'), true));
            });
        }

        verify().then((editor) => {
            if (!editor) {
                res.sendStatus(403);
                return;
            }

            const nickname = req.body.nickname;
            const userId = req.body.userId;

            const queryString = 'UPDATE users SET real_name = ? WHERE user_id = ?';
            const queryArray = [nickname, userId];
            utils.mysql_query(res, queryString, queryArray, (results, res) => {
                utils.log(editor, utils.actions.EDIT, utils.entities.USER, null, JSON.stringify({"name": nickname}));
                res.sendStatus(200);
            });

        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;