const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Postman can be used to test post request {"sectionId": 1}
router.post('/', (req, res) => {

    try{
        const sectionId = req.body.sectionId;

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
                connection.query('SELECT * FROM files WHERE section_id = ?', [sectionId], (err, results) => {
                    if (err) throw res.sendStatus(400);
                    resolve(results);
                });
            });
        }

        getList().then(result => {
            res.send(result);

        }).finally(() => {
            connection.end();
        });

    }catch (err) {
        res.sendStatus(500);
    }

});

module.exports = router;