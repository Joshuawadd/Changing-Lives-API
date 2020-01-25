const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// random generate a user name like cis -abcd12
function randomUsername(){
    var arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    var id = '';
    var n = 4 ; // sum of numbers
    for (var i = 0;i<n; i++){
        id += arr[Math.floor(Math.random() * 26)]
    }
    var m = 2 ; // sum of digits
    for (var j = 0; j < m; j++){
        id += Math.floor(Math.random() * 10)
    }
    return id
}


// Random user password
function randomPassword(length = 10) {
    length = Number(length)
    // Limit length
    if (length < 6) {
      length = 6
    } else if (length > 16) {
      length = 16
    }
    let passwordArray = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '1234567890', '!@#$%&*()'];
    var password = [];
    let n = 0;
    for (let i = 0; i < length; i++) {
      // If password length less than 9, all value random
      if ( password.length < (length - 4) ) {
        // Get random passwordArray index
        let arrayRandom = Math.floor(Math.random() * 4);
        // Get password array value
        let passwordItem = passwordArray[arrayRandom];
        // Get password array value random index
        // Get random real value
        let item = passwordItem[Math.floor(Math.random() * passwordItem.length)];
        password.push(item);
      } else {
        // If password large then 9, lastest 4 password will push in according to the random password index
        // Get the array values sequentially
        let newItem = passwordArray[n];
        let lastItem = newItem[Math.floor(Math.random() * newItem.length)];
        // Get array splice index
        let spliceIndex = Math.floor(Math.random() * password.length);
        password.splice(spliceIndex, 0, lastItem);
        n++
      }
    }
    return password.join("");
  }
//Postman can be used to test post request {"real_name": "bod bod, "username": "abcd12", "password":"12345", "password_salt":"salt", "is_admin":0}
router.post('/', (req, res) => {
    // people only need to post the real name and whether is an admin account to create an account
    const real_name = req.body.real_name;
    const username = randomUsername();
    const password = randomPassword();
    const salt = '0' // currently set the salt to 0
    const is_admin = Number(req.body.is_admin); // is_admin should be an integer,either 0 or 1


    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT
    });

    connection.connect((err) => {
        if (err) throw err;
    });

    connection.query('INSERT INTO users (real_name, username, password, password_salt, is_admin) VALUES (?,?,?,?,?)',
        [real_name, username, password, salt, is_admin], (err) => {
            if (err) throw res.sendStatus(400);
        });

    connection.end();

    return res.sendStatus(200);
});

module.exports = router;