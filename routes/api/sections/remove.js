const express = require('express');
const router = express.Router();
const utils = require('../../../utils');

//Postman can be used to test post request {"sectionId": 1} or {"user_id": 1} Removing by user id will not work properly now
router.post('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), true));
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
                //update later positions to keep them all 1 apart
                utils.mysql_query(res, 'SELECT position FROM sections WHERE section_id = ?', [sectionId], (results, res) => {
                    utils.mysql_query(res, 'UPDATE sections SET position = position - 1 WHERE position > ?', [results[0]['position']], (results, res) => {});
                });
                const queryString = 'DELETE FROM sections WHERE section_id = ?';
                const queryString2 = 'DELETE FROM files WHERE section_id = ?';
                utils.mysql_query(res, queryString, [sectionId], (results, res) => {res.sendStatus(200);});
                utils.mysql_query(res, queryString2, [sectionId], (results, res) => {});
            } else if (!isNaN(userId)) {
                //this doesn't seem necessary and will cause issues with positioning so don't use at the moment
                const queryString = 'DELETE FROM sections WHERE user_id = ?';
                const queryString2 = 'DELETE FROM files WHERE user_id = ?';
                utils.mysql_query(res, queryString, [userId], (results, res) => {res.sendStatus(200);});
                utils.mysql_query(res, queryString2, [userId], (results, res) => {});
            } else { //no user or section was provided so the request makes no sense
                return res.sendStatus(400);
            }
        });

    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;