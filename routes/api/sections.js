const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: './public/files',
    filename: function (req, file, cb) {        
        // null as first argument means no error
        cb(null, file.originalname );
    }
});
var upload = multer({ storage: storage });

const mysql_query = require('../../mysql_query');

class Section { //this is the class for an app section or page
    constructor(id=0,name = '',text='No text added',position=0, files=[['name','path']]) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position =position;
        this.files = files;
    }
}

//Postman can be used to test post request {"username": "username", "password": "temppass"}
router.get('/', (req, res) => {
    try {
        var token = req.query.token;
        jwt.verify(token, 'userToken', function(err, decoded){
            if(!err){
                const connection = mysql.createConnection({
                    host: process.env.MYSQL_HOST,
                    user: process.env.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD,
                    database: process.env.MYSQL_DATABASE
                });

                connection.connect((err) => {
                    if (err) throw err;
                });

                function getList(){
                    return new Promise((resolve, reject) => {
                        connection.query(`SELECT sections.section_id, sections.article_text, sections.section_name, files.file_name, files.file_link FROM sections
                                            LEFT JOIN files ON sections.section_id = files.section_id
                                            `, [], (err, results) => {
                            if (err) throw res.sendStatus(400);
                            resolve(results);
                        });
                    });
                }
                getList().then(result => {
                    res.status(200).send(JSON.stringify(result));
                }).finally(() => {
                    //res.sendStatus(200);
                });
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
/*
router.post('/add', upload.array('section_files[]', 20), (req, res) => {
    try {
        var token = req.header('Authorisation');
        jwt.verify(token, 'userToken', function(err, decoded){
            if(!err){
                let sectionTitle = req.body.sectionName;
                let sectionText = req.body.sectionText;
                console.log('sec',sectionTitle, sectionText);
                //let sectionId = req.body.sectionId; not required for new sections
                let sectionFiles = [];
                for (var i = 0; i < req.files.length; i++) {
                    sectionFiles.push(req.files[i].originalname);
                }
                let fileTitles = JSON.parse(req.body.fileTitles);
                var sectionId = -1;
                const queryStringSection = `INSERT INTO sections (section_name, article_text, user_id)
                                            VALUES ('${sectionTitle}', '${sectionText}', 0);`; //also needs section position
                mysql_query(queryStringSection, (err,rows,fields)=>{
                    if (err){
                        throw err;
                    }
                    sectionId = rows.insertId; //get the id the new section was inserted at
                });
                console.log(fileTitles, sectionFiles);
                for (var k = 0; k < fileTitles.length; k++) {
                    let queryStringFiles = `INSERT INTO files (file_name, file_link, section_id, user_id)
                                            VALUES ('${fileTitles[k][0]}', '${sectionFiles[k]}',${sectionId}, 0);`;
                    mysql_query(queryStringFiles, (err,rows,fields)=>{
                        if (err){
                            throw err;
                        }
                    });
                }
                res.status(200).send('ok');
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
*/
module.exports = router;
