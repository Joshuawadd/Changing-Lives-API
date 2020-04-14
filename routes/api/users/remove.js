const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const Joi = require('joi');

//userid is required
function validate(req) {
    const schema = {
        userId: Joi.number().integer().min(0).max(2147483647).required()
    };
    return Joi.validate(req, schema);
}

//Postman can be used to test post request {"user_id": 1}
router.post('/', (req, res) => {

    const {error} = validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }

    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.header('Authorization'), true));
            });
        }

        verify().then((editor) => {
            if (!editor) {
                res.sendStatus(403);
                return;
            }
            const userId = req.body.userId;

            if (!isNaN(userId)) {
                utils.mysql_query(res, 'SELECT * FROM users WHERE is_admin = 1', [], (adminUsers, res) => {
                    if (adminUsers.length === 1) {
                        if (userId === adminUsers[0].user_id) {
                            res.status(400).send('Cannot delete the last admin user!');
                            return;
                        }
                    }
                    const queryString = 'DELETE FROM users WHERE user_id = ?';
                    const queryArray = [userId];
                    utils.mysql_query(res, 'SELECT * FROM users WHERE user_id = ?', [userId], (results, res) => {
                        let userRemove = JSON.stringify({
                            "id": results[0].user_id,
                            "nickname": results[0].real_name,
                            "name": results[0].username,
                            "password": results[0].password,
                            "passwordSalt": results[0].password_salt,
                            "isAdmin": results[0].is_admin.readUInt8()
                        });
                        utils.mysql_query(res, queryString, queryArray, (results, res) => {
                            utils.log(editor, utils.actions.REMOVE, utils.entities.USER, null, userRemove);
                            res.sendStatus(200);
                        });
                    });
                });
            }
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;