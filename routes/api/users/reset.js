const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const utils = require('../../../utils');

//Postman can be used to test post request {"userId": 34}
router.post('/', (req, res) => {
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
            const userId = req.body.userId;
            const password = utils.randomPassword();
            const salt = bcrypt.genSaltSync(10);
            const hashed_pass = bcrypt.hashSync(password, salt);
            const queryString = 'UPDATE users SET password = ?, password_salt = ? WHERE user_id = ?';
            const queryArray = [hashed_pass, salt, userId];
            utils.mysql_query(res,'SELECT username FROM users WHERE user_id = ?',[userId], (results, res) => {
                let username = results[0].username;
                utils.mysql_query(res, queryString, queryArray, (rt, res) => {
                    utils.log(editor, utils.actions.RESET, utils.entities.USER, null, JSON.stringify({"name": username})); 
                    res.status(200).send(password);
                });
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;