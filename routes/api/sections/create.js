const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const tv = require('../tokenVerify');
const multer = require('multer');
const utils = require('../../../utils');

const storage = multer.diskStorage({
    destination: './public/files',
    filename: function (req, file, cb) {
        // null as first argument means no error
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

//Postman can be used to test post request {"section_name": "test", "article_text":"This is a comment"}
router.post('/', upload.array('section_files[]', 20), (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(tv.tokenVerify(req.header('Authorization')));
            });
        }
        verify().then((result) => {
            if (!result) {
                res.sendStatus(403);
                return;
            }

            const section_name = req.body.sectionName;
            const article_text = req.body.sectionText;

            let sectionFiles = [];

            for (let i = 0; i < req.files.length; i++) {
                sectionFiles.push(req.files[i].originalname);
            }

            let fileTitles = JSON.parse(req.body.fileTitles);

            const queryString = 'INSERT INTO sections (user_id,section_name,article_text, position) VALUES (?,?,?,?)';
            const queryArray = [0, section_name, article_text, -1];

            utils.mysql_query(res, queryString, queryArray, (results, res) => {
                const sectionId = results.insertId;
                const queryString2 = 'UPDATE sections SET position = ? WHERE section_id = ?';
                const queryArray2 = [sectionId, sectionId];
                utils.mysql_query(res, queryString2, queryArray2, (results, res) => {} );
                const queryString3 = 'INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)';
                let queryArray3 = [];
                for (let j = 0; j < fileTitles.length; j++) {
                    queryArray3 = [fileTitles[j], sectionFiles[j], result, 0];
                    utils.mysql_query(res, queryString3, queryArray3, (results, res) => {});
                }
                res.sendStatus(200);
            });


/*
            function addSection() {
                return new Promise((resolve) => {
                    connection.query('INSERT INTO sections (user_id,section_name,article_text, position) VALUES (?,?,?,?)', [0, section_name, article_text, -1], (err, results) => {
                        if (err) throw res.sendStatus(400);
                        resolve(results.insertId);
                    });
                });
            }

            addSection().then((result) => {
                connection.query('UPDATE sections SET position = ? WHERE section_id = ?', [result, result], (err, results) => {
                    if (err) throw res.sendStatus(400);
                });
                for (let j = 0; j < fileTitles.length; j++) {
                    connection.query('INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)', [fileTitles[j], sectionFiles[j], result, 0], (err) => {
                        if (err) throw res.sendStatus(400);
                    });
                }
                res.sendStatus(200);

            }).finally(() => {
                connection.end();
            });*/
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;