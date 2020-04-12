const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const utils = require('../../../utils');

//Postman can be used to test post request {"userId": 34, "password": password}
router.post('/', (req, res) => {
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), false));
            });
        }

        verify().then((editor) => {
            if (!editor) {
                res.sendStatus(403);
                return;
            }
            const userId = req.body.userId;
            const password = req.body.password;
            if (parseInt(userId) !== parseInt(editor)) {
                res.sendStatus(403);
                return;
            }

            function get_hashed_password(plain_text_password) {
                return new Promise((resolve) => {
                    bcrypt.genSalt(10).then((salt) => {
                        bcrypt.hash(plain_text_password, salt).then((result) => {
                            resolve([result, salt])
                        });
                    });
                });
            }

            get_hashed_password(password).then((result) => {

                // Both error handling has not been tested and was the result of a quick brainstorm of potential issues
                if (password == null || password === '') {
                    res.sendStatus(500);
                    return;
                }

                //Check if the result produced is an array that holds the hashed password and the hash salt
                if (!(Array.isArray(result) && result.length === 2)) {
                    res.sendStatus(500);
                    return;
                }

                const hashed_password = result[0];
                const salt = result[1];

                const queryString = 'UPDATE users SET password = ?, password_salt = ?, force_reset = ? WHERE user_id = ?';
                let fr = 0;
                const queryArray = [hashed_password, salt, fr, userId];
                utils.mysql_query(res, 'SELECT username FROM users WHERE user_id = ?', [userId], (results, res) => {
                    //Watch out for this line, it caused me an error that MAGICALLY dissapeared
                    if (results.length > 0) {
                        let username = results[0].username;
                        utils.mysql_query(res, queryString, queryArray, (rt, res) => {
                            utils.log(editor, utils.actions.CHANGE, utils.entities.USER, null, JSON.stringify({"name": username}));
                            res.sendStatus(200);
                        });
                    } else {
                        res.sendStatus(400);
                    }
                });

            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;