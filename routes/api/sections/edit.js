const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const multer  = require('multer');

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
        jwt.verify(req.header('Authorisation'), process.env.TOKEN_USER, (err) => {
            if (err) {
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
            const connection = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });

            connection.connect((err) => {
                if (err) throw err;
            });

            connection.query('UPDATE sections SET section_name = ?, article_text = ? WHERE section_id = ?', [sectionName, sectionText, sectionId], (err) => {
                if (err) throw res.sendStatus(400);
            });

            for (let j = 0; j < files.length; j++) {
                //file existed before
                if (newFilePaths[j] === '') {
                    connection.query('UPDATE files SET file_name = ? WHERE file_id = ?', [files[j].title, files[j].id], (err, results) => {
                        if (err) throw res.sendStatus(400);
                    });

                } else {
                    //file needs to actually be added to db
                    connection.query('INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)', [files[j].title, newFilePaths[j], sectionId, 0], (err, results) => {
                        if (err) throw res.sendStatus(400);
                    });
                }
            }
            for (let k = 0; k < fileRemove.length; k++) {
                connection.query('DELETE FROM files WHERE file_id = ?', [fileRemove[k]], (err, results) => {
                    if (err) throw res.sendStatus(400);
                });
            }

            connection.end();

            res.sendStatus(200);
        });

    } catch(err) {
        res.sendStatus(500);
    }
});

module.exports = router;