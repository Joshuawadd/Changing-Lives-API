const express = require('express');
const router = express.Router();
const utils = require('../../../utils');

//Postman can be used to test post request {"user_id": 1}
router.post('/', (req, res) => {
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
            const userId = req.body.userId;

            if (!isNaN(userId)) {
                const queryString = 'DELETE FROM users WHERE user_id = ?';
                const queryArray = [userId];
                utils.mysql_query(res, queryString, queryArray, (results, res) => {utils.log(editor, utils.actions.REMOVE, utils.entities.USER, null, JSON.stringify({"name": userId}));res.sendStatus(200);});
            }
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;