const express = require('express');
const router = express.Router();
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
                const queryStringSections = `SELECT * FROM sections;`; //for now there are no params so always return all
                const queryStringFiles = `SELECT * FROM files;`; //get all files too
                var sections = []; //define sections variable
                var files = [];
                mysql_query(queryStringFiles, (err,rows,fields)=>{ //having problems with async functions
                    if (err){
                        throw err;
                    }
                    for (let i = 0; i < rows.length; i++) {
                        files.push(rows[i]);
                    }
                    console.log('files',files);
                });
                mysql_query(queryStringSections, (err,rows,fields)=>{ 
                    if (err){
                        throw err;
                    }
                    if(rows.length >= 1){ // some sections exist
                        for (let i = 0; i < rows.length; i++ ) {
                            let secFiles = []
                            for (var j = 0; j < files.length; j++) {
                                if (files[j]['section_id'] == rows[i]['section_id']) {
                                    secFiles.push([files[j]['file_name'],files[j]['file_link']])
                                }
                            }
                            sections.push(new Section(rows[i]['section_id'],rows[i]['section_name'],rows[i]['article_text'],secFiles));
                            console.log('sc',sections);
                        }
                    } else {
                        res.status(500).send('No sections exist');
                        return false; // user shouldn't log into the system
                    }
                });
                console.log(sections);
                sections.push(new Section(0,'Section','hello',0,[]));
                let sections_send = JSON.stringify(sections);
                res.status(200).send(sections_send); //just always sends ok as an example
            } else {
                res.status(403).send(err);
            }
        });
    } catch(err) {
        res.status(500).send(err);
        return false;
    }
});

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

module.exports = router;
