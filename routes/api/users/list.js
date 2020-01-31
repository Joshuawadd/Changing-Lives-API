const express = require('express');
const router = express.Router();
const mysql = require('mysql');

class User {
    constructor(id = 0, name = '', username = '', password = '') {
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
    }
}

router.get('/', (req, res) => {

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    function getList() {
        return new Promise((resolve) => {
            connection.query('SELECT user_id, real_name, username, password FROM users', [], (err, results) => {
                if (err) throw res.sendStatus(400);
                resolve(results);
            });
        });
    }

    getList().then(result => {
        let userData = result;
        let users = [];
        for (let i = 0; i < userData.length; i++) {
            users.push(new User(userData[i].user_id, userData[i].real_name, userData[i].username, userData[i].password));
        }
        return res.send(users);

    }).finally(() => {
        connection.end();
    });

});

module.exports = router;