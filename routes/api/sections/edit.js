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

            const section_name = req.body.sectionName;
            const article_text = req.body.sectionText;

            let sectionFiles = [];

            for (let i = 0; i < req.files.length; i++) {
                sectionFiles.push(req.files[i].originalname);
            }

            const fileTitles = JSON.parse(req.body.fileTitles);
            const sectionId = req.body.sectionId;

            let numNewFiles = fileTitles.length - sectionFiles.length;

            for (let i = 0; i < numNewFiles; i++ ) {
                sectionFiles.unshift('');
            }

            const connection = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });

            connection.connect((err) => {
                if (err) throw err;
            });

            connection.query('UPDATE sections SET section_name = ?, article_text = ? WHERE section_id = ?', [section_name, article_text, sectionId], (err) => {
                if (err) throw res.sendStatus(400);
            });

            for (let j = 0; j < fileTitles.length; j++) {

                //file existed before
                if (sectionFiles[j] === '') {
                    connection.query('UPDATE files SET file_name = ? WHERE file_link = ?', [fileTitles[j], sectionFiles[j]], (err, results) => {
                        if (err) throw res.sendStatus(400);
                    });

                } else {
                    //file needs to actually be added to db
                    connection.query('INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)', [fileTitles[j], sectionFiles[j], sectionId, 0], (err, results) => {
                        if (err) throw res.sendStatus(400);
                    });
                }
            }

            connection.end();

            res.sendStatus(200);
        });

    } catch(err) {
        res.sendStatus(500);
    }
});

module.exports = router;