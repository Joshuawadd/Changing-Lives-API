const express = require('express');
const router = express.Router();
const utils = require('../../../utils');

//Postman can be used to test post request {"sectionId": 1} or {"user_id": 1}
router.post('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization')));
            });
        }
        verify().then((result) => {
            if (!result) {
                res.sendStatus(403);
                return;
            }
            const sectionId = req.body.sectionId;
            const userId = req.body.userId;
            if (!isNaN(sectionId)) {
                const queryString = 'DELETE FROM sections WHERE section_id = ?';
                const queryString2 = 'DELETE FROM files WHERE section_id = ?';
                utils.mysql_query(res, queryString, [sectionId], (results, res) => {});
                utils.mysql_query(res, queryString2, [sectionId], (results, res) => {});
            } else if (!isNaN(userId)) {
                const queryString = 'DELETE FROM sections WHERE user_id = ?';
                const queryString2 = 'DELETE FROM files WHERE user_id = ?';
                utils.mysql_query(res, queryString, [userId], (results, res) => {});
                utils.mysql_query(res, queryString2, [userId], (results, res) => {});
            } else { //no user or section was provided so the request makes no sense
                return res.sendStatus(400);
            }
            res.sendStatus(200);
        });

    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;