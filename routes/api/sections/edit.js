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
var upload = multer({ storage: storage });

//Postman can be used to test post request {"user_id": 1, "section_name": "test", "article_text":"This is a comment"}
router.post('/', upload.array('section_files[]', 20), (req, res) => {
    try {
        var token = req.header('Authorisation');
        jwt.verify(token, 'userToken', function(err, decoded){
            if(!err){
                //const user_id = req.body.user_id; this isnt useful
                const section_name = req.body.sectionName;
                const article_text = req.body.sectionText;
                let sectionFiles = [];
                for (let i = 0; i < req.files.length; i++) {
                    sectionFiles.push(req.files[i].originalname);
                }
                let fileTitles = JSON.parse(req.body.fileTitles);
                const sectionId = req.body.sectionId;
                var numNewFiles = fileTitles.length - sectionFiles.length; //pad out sectionFiles for files with just updated titles
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
                connection.query('UPDATE sections SET section_name = ?, article_text = ? WHERE section_id = ?', [section_name, article_text, sectionId], (err, results) => {
                    if (err) throw res.sendStatus(400);
                });
                console.log(fileTitles, sectionFiles); //this doesnt update section titles as file_link needs to be replaced by file_id
                for (var k = 0; k < fileTitles.length; k++) {
                    if (sectionFiles[k] === '') { //file existed before 
                        connection.query('UPDATE files SET file_name = ? WHERE file_link = ?', [fileTitles[k], sectionFiles[k]], (err, results) => {
                            if (err) throw res.sendStatus(400);
                        });
                    } else { //file needs to actually be added to db
                        connection.query('INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)', [fileTitles[k], sectionFiles[k], sectionId, 0], (err, results) => {
                            if (err) throw res.sendStatus(400);
                        });
                    }
                }
                res.status(200).send('OK');
                connection.end();
            } else {
                res.status(403).send(err);
            }
        });
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
        return false;
    }
});

module.exports = router;