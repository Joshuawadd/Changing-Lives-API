const express = require('express');
const router = express.Router();
const multer = require('multer');
const utils = require('../../../utils');

const upload = multer();

//Postman can be used to test post request {"realName":"James", "userName":"abcd12", "userPassword":"abcdefg", "userId": 0}
router.post('/', upload.none(), (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')), true);
            });
        }
        verify().then((editor) => {
            if (!editor) {
                res.sendStatus(403);
                return;
            }

            const realName = req.body.realName;
            const userName = req.body.userName;
            const userPassword = req.body.userPassword;
            const userId = req.body.userId;

            const queryString = 'UPDATE users SET real_name = ?, username = ?, password = ? WHERE user_id = ?';
            const queryArray = [realName, userName, userPassword, userId];
            utils.mysql_query(res, queryString, queryArray, (results, res) => {utils.log(editor, utils.actions.EDIT, utils.entities.USER, null, JSON.stringify({"name": userName})); res.sendStatus(200);});

        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;