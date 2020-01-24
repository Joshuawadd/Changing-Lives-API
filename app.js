require('dotenv').config();

const express = require('express');
const path = require('path');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/api/login');
const sectionsRouter = require('./routes/api/sections');

//file protecting adapted from https://stackoverflow.com/questions/11910956/how-to-protect-a-public-dynamic-folder-in-nodejs
function userIsAllowed(req, callback) {
    var token = req.query.token;
    jwt.verify(token, 'userToken', function(err, decoded){
        if(!err){
            callback(true);
        } else {
            callback(false);
        }
    });
};
// This function returns a middleware function
var protectPath = function(regex) {
return function(req, res, next) {
    if (!regex.test(req.url)) { return next(); }

    userIsAllowed(req, function(allowed) {
    if (allowed) {
        next(); // send the request to the next handler, which is express.static
    } else {
        res.end('You do not have permission to view this file!');
    }
    });
};
};

const app = express();
const PORT = 3000;

app.use(protectPath(/^\/files\/.*$/));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/login', loginRouter);
app.use('/api/sections', sectionsRouter);

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
