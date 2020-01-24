const Joi = require('joi');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const mysql_query = require('../../mysql_query');


//Postman can be used to test post request {"username": "username", "password": "temppass"}
router.post('/', (req, res) => {
    const {error} = validate(req.body);
    if (error) {
        res.status(500).send('Incorrect Fields');
        return false;
    }
    const username = req.body.username;
    const password = req.body.password;
    var token = jwt.sign({uname: username}, 'userToken',{expiresIn: 120});
    // res.status(200).send(token); //just always sends ok as an example
    // return true;
    
    // connection details, will save it in .dev file later

    var password_in_database; // used to store the password grabed from database
    
    // const connection = mysql.createConnection({
    //     host:***REMOVED***,
    //     user:***REMOVED***,
    //     password:***REMOVED***,
    //     port: ***REMOVED***,
    //     database: ***REMOVED***
    // })
    // connection.connect(function(err){
    //     if(err){
    //         console.error('error connecting: ' + err.stack);
    //     }
    //     console.log('connected as id ' + connection.threadId);
    // });
    const queryString = `SELECT password FROM users where username = '${username}' `;
    // const queryString = `SELECT password FROM users where ?`;

    // mysql_query(queryString,{username: username}, (err,rows,fields)=>{ //parameter error in this way
    mysql_query(queryString, (err,rows,fields)=>{ 
        if (err){
            throw err
        }
        if(rows.length === 1){ // username in the database
            password_in_database = rows[0]['password'];
            if(password === password_in_database){ //password matches the password in the database
                res.status(200).send(token);
                return true // user should log into the system here
            }
        }
        res.status(500).send('Incorrect Fields');
        return false // user shouldn't log into the system
})
    // res.end()
});
router.get('/silent', (req, res) => {
    var token = req.query.token;
    jwt.verify(token, 'userToken', function(err, decoded){
        if(!err){
            res.status(200).send('OK'); //just always sends ok as an example
        } else {
            res.status(403).send(err);
        }
    });
});

//Can be used for checking if variables follow certain formats, check out JOI on google for more details
function validate(req) {
    const schema = {
        username: Joi.string().min(5).max(16).required(),
        password: Joi.string().min(5).max(32).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;
