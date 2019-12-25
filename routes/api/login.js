const Joi = require('joi');
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const {error} = validate(req.body);

    //Postman can be used to test post request {"username": "username", "password": "temppass"}

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //Temp variables -> use req.body.username/password directly to avoid using up more memory than needed
    const username = req.body.username;
    const password = req.body.password;

    return res.status(200).send(`Username: ${username} and Password: ${password}`);
});

function validate(req) {
    const schema = {
        username: Joi.string().min(5).max(16).required(),
        password: Joi.string().min(5).max(32).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;
