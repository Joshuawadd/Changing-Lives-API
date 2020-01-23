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
    //sections will come from db in future
    let sections = [new Section(0,'Section 1','Here is some text about S1',0),new Section(1,'Section 2','Here is some text about S2',1)];
    let sections_send = JSON.stringify(sections);
    var token = req.query.token;
    jwt.verify(token, 'userToken', function(err, decoded){
        if(!err){
            res.status(200).send(sections_send); //just always sends ok as an example
        } else {
            res.status(403).send(err);
        }
    });
});

router.post('/add', upload.array('section_files[]', 20), (req, res) => {
    var token = req.header('Authorisation');
    jwt.verify(token, 'userToken', function(err, decoded){
        if(!err){
            let sectionTitle = req.body.sectionTitle;
            let sectionText = req.body.sectionText;
            let sectionFiles = [];
            for (var i = 0; i < req.files.length; i++) {
                sectionFiles.push('',req.files[i].originalname);
            }
            let fileTitles = req.body.fileTitles;
            //check if there are any current files asscociated with section
            //if yes append the new files
            //set file titles for all files
            //save all information to the database
            res.status(200).send('ok');
        } else {
            res.status(403).send(err);
        }
    });
});

module.exports = router;
