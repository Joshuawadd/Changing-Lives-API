const express = require('express');
const router = express.Router();
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
                resolve(utils.tokenVerify(req.header('Authorization')));
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
                utils.mysql_query(res, 'SELECT MAX(position) FROM sections', [], (oldPos, res) => {
                    let newPos = oldPos[0]['MAX(position)']+1;
                    const queryString2 = 'UPDATE sections SET position = ? WHERE section_id = ?';
                    const queryArray2 = [newPos, sectionId];
                    utils.mysql_query(res, queryString2, queryArray2, (results, res) => {} );
                });
                const queryString3 = 'INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)';
                let queryArray3 = [];
                for (let j = 0; j < fileTitles.length; j++) {
                    queryArray3 = [fileTitles[j], sectionFiles[j], sectionId, 0];
                    utils.mysql_query(res, queryString3, queryArray3, (results, res) => {});
                }
                res.sendStatus(200);
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;