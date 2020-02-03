const express = require('express');
const router = express.Router();
const multer  = require('multer');
const utils = require('../../../utils');
const storage = multer.diskStorage({
    destination: './public/files',
    filename: function (req, file, cb) {        
        // null as first argument means no error
        cb(null, file.originalname );
    }
});

const upload = multer({ storage: storage });

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
            
            const sectionName = req.body.sectionName;
            const sectionText = req.body.sectionText;
            const sectionId = req.body.sectionId;
            let newFilePaths = [];

            for (let i = 0; i < req.files.length; i++) {
                newFilePaths.push(req.files[i].originalname);
            }

            const files = JSON.parse(req.body.files);
        
            let numOldFiles = files.length - newFilePaths.length;

            for (let i = 0; i < numOldFiles; i++ ) {
                newFilePaths.unshift('');
            }
            const fileRemove = JSON.parse(req.body.fileRemove);

            const queryString = 'UPDATE sections SET section_name = ?, article_text = ? WHERE section_id = ?';
            const queryArray = [sectionName, sectionText, sectionId];
            utils.mysql_query(res, queryString, queryArray, (results, res) => {res.sendStatus(200);});
            for (let j = 0; j < files.length; j++) {
                //file existed before
                if (newFilePaths[j] === '') {
                    utils.mysql_query(res, 'UPDATE files SET file_name = ? WHERE file_id = ?', [files[j].title, files[j].id], (results, res) => {});
                } else { //file needs to actually be added to db
                    utils.mysql_query(res, 'INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)', [files[j].title, newFilePaths[j], sectionId, 0], (results, res) => {});
                }
            }
            for (let k = 0; k < fileRemove.length; k++) { //files that have now been removed
                utils.mysql_query(res, 'DELETE FROM files WHERE file_id = ?', [fileRemove[k]], (results, res) => {});
            }
        });

    } catch(err) {
        res.sendStatus(500);
    }
});

module.exports = router;