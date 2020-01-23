const Joi = require('joi');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const mysql_query = require('../../mysql_query');
class Section { //this is the class for an app section or page
    constructor(id=0,name = '',text='No text added',position=0, links = []) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position =position;
        this.links = links;
    }

    listHTML() {
        return `<li class="list-group-item"><h4>${this.name}</h4>
                    <span class="badge badge-dark"><a href="#" id="edit_btn_${this.id}" onclick="editSection(event,${this.id});">Edit</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvup_btn_${this.id}">Move Up</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvdn_btn_${this.id}">Move Down</a></span>
                    <span class="badge badge-dark"><a href="#" id="rmve_btn_${this.id}">Remove</a></span>
                </li>`;
    }
}
//Postman can be used to test post request {"username": "username", "password": "temppass"}
router.get('/', (req, res) => {
    const {error} = validate(req.body);
    let sections = [new Section(0,'Section 1','Here is some text about S1',0),new Section(1,'Section 2','Here is some text about S2',1)];
    let sections_send = JSON.stringify(sections);
    res.status(200).send(sections_send); //just always sends ok as an example
    if (error) {
        return false;
    }

    const username = req.body.username;
    const password = req.body.password;

    mysql_query('SELECT * FROM ? where username = ?', ['users', username], (err, row) => {
        //Since the username field is a unique field, if the username does exist, only 1 row should be returned
        // row = (user_id, username, password, password_salt)

        if (row.length === 1) {
            const passwd = row[2];
            const passwd_salt = row[3];

            const salted_password = bcrypt.hashSync(password, passwd_salt);

            if (salted_password === passwd) {
                console.log("Passwords match");
                return true;
            }
        }

    });

    return false;
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
