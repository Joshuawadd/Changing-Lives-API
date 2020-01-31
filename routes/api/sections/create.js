const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const multer = require('multer');

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
        jwt.verify(req.header('Authorisation'), process.env.TOKEN_USER, (err) => {
            if (err) return res.status(403);

            const section_name = req.body.sectionName;
            const article_text = req.body.sectionText;

            let sectionFiles = [];

            for (let i = 0; i < req.files.length; i++) {
                sectionFiles.push(req.files[i].originalname);
            }

            let fileTitles = JSON.parse(req.body.fileTitles);

            const connection = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });

            connection.connect((err) => {
                if (err) throw err;
            });

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
                return res.status(200);

            }).finally(() => {
                connection.end();
            });
        });
    } catch (err) {
        return res.status(500);
    }
});

module.exports = router;