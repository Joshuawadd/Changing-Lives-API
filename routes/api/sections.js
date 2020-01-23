const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const mysql_query = require('../../mysql_query');

class Section { //this is the class for an app section or page
    constructor(id=0,name = '',text='No text added',position=0, links = []) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position =position;
        this.links = links;
    }
}

//Postman can be used to test post request {"username": "username", "password": "temppass"}
router.get('/', (req, res) => {
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

module.exports = router;
