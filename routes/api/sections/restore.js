const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const Joi = require('joi');

function validate(req) {
    const schema = {
        sectionName: Joi.string().max(31).required(),
        sectionText: Joi.string().max(65535).allow(''),
        sectionFiles: Joi.optional()
    };
    return Joi.validate(req, schema);
}

//Postman can be used to test post request {"sectionName": "test", "sectionText":"This is a comment", "sectionFiles": [{object}]}
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
                resolve(utils.tokenVerify(req.header('Authorization')), true);
            });
        }

        verify().then((userId) => {
            if (!userId) {
                res.sendStatus(403);
                return;
            }

            const section_name = req.body.sectionName;
            const article_text = req.body.sectionText;
            const sectionFiles = JSON.parse(req.body.sectionFiles);

            const queryString = 'INSERT INTO sections (user_id,section_name,article_text, position) VALUES (?,?,?,?)';
            const queryArray = [0, section_name, article_text, -1];

            utils.mysql_query(res, queryString, queryArray, (results, res) => {
                const sectionId = results.insertId;
                utils.mysql_query(res, 'SELECT MAX(position) FROM sections', [], (oldPos, res) => {
                    let newPos = oldPos[0]['MAX(position)'] + 1;
                    const queryString2 = 'UPDATE sections SET position = ? WHERE section_id = ?';
                    const queryArray2 = [newPos, sectionId];
                    utils.mysql_query(res, queryString2, queryArray2, (results, res) => {
                        utils.log(userId, utils.actions.RESTORE, utils.entities.SECTION, null, JSON.stringify({"name": section_name}));
                        res.sendStatus(200);
                    });
                });
                const queryString3 = 'INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)';
                let queryArray3 = [];
                for (let j = 0; j < sectionFiles.length; j++) {
                    queryArray3 = [sectionFiles[j].title, sectionFiles[j].path, sectionId, 0];
                    utils.mysql_query(res, queryString3, queryArray3, (results, res) => {
                    });
                }
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;