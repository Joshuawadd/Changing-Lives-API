const express = require('express');
const router = express.Router();
const utils = require('../../../utils');

//Postman can be used to test post request {"sectionId": 1}
router.post('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), true));
            });
        }

        verify().then((userId) => {
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const sectionId = req.body.sectionId;
            if (!isNaN(sectionId)) {
                //update later positions to keep them all 1 apart
                utils.mysql_query(res, `SELECT sections.section_id, sections.article_text, sections.section_name, sections.position, files.file_id, files.file_name, files.file_link 
                FROM sections LEFT JOIN files ON sections.section_id = files.section_id WHERE sections.section_id = ?`, [sectionId], (results, res) => {
                    utils.mysql_query(res, 'UPDATE sections SET position = position - 1 WHERE position > ?', [results[0]['position']], (results, res) => {
                    });
                    let files = [];
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].file_id !== null) {
                            files.push({
                                "id": results[i].file_id,
                                "title": results[i].file_name,
                                "path": results[i].file_link
                            });
                        }
                    }
                    let secRemove = JSON.stringify({
                        "id": results[0].section_id,
                        "name": results[0].section_name,
                        "text": results[0].article_text,
                        "position": results[0].position,
                        "files": files
                    });
                    const queryString = 'DELETE FROM sections WHERE section_id = ?';
                    const queryString2 = 'DELETE FROM files WHERE section_id = ?';
                    utils.mysql_query(res, queryString, [sectionId], (results, res) => {
                        utils.log(userId, utils.actions.REMOVE, utils.entities.SECTION, '{}', secRemove);
                        res.sendStatus(200);
                    });
                    utils.mysql_query(res, queryString2, [sectionId], (results, res) => {
                    });
                });
            } else { //no section was provided so the request makes no sense
                return res.sendStatus(400);
            }
        });

    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;