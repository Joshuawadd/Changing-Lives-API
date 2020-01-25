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

    //const user_id = req.body.user_id; this isnt useful
    const section_name = req.body.sectionName;
    const article_text = req.body.sectionText;
    let sectionFiles = [];
    for (var i = 0; i < req.files.length; i++) {
        sectionFiles.push(req.files[i].originalname);
    }
    let fileTitles = JSON.parse(req.body.fileTitles);
    var sectionId = -1;

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });
    function addSection(){
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO sections (user_id,section_name,article_text) VALUES (?,?,?)', [0, section_name, article_text], (err, results) => {
                if (err) {console.log(err);throw res.sendStatus(400);}
                resolve(results.insertId);
            });
        });
    }
    addSection().then(sId => {
        console.log('s',sId);
        for (var k = 0; k < fileTitles.length; k++) {
            connection.query('INSERT INTO files (file_name, file_link, section_id, user_id) VALUES (?,?,?,?)', [fileTitles[k][0], sectionFiles[k], sId, 0], (err, results) => {
                if (err) throw res.sendStatus(400);
            });
        }
        res.status(200).send('OK');
    }).finally(() => {
        connection.end();
    });
});

module.exports = router;