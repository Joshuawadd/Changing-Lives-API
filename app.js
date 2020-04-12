require('dotenv').config();

const express = require('express');
const path = require('path');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');
const indexRouter = require('./routes/index');

//file protecting adapted from https://stackoverflow.com/questions/11910956/how-to-protect-a-public-dynamic-folder-in-nodejs
function userIsAllowed(req, callback) {
    const token = req.query.token;

    function checkUser(token) { //this will accept user or staff tokens
        jwt.verify(token, process.env.USER_KEY, (err, decoded) => {
            if (err) {
                checkStaff(token); //user check failed, so check for staff token
            } else {
                callback(true); //user token valid
            }
        });
    }

    function checkStaff(token) {
        jwt.verify(token, process.env.STAFF_KEY, (err, decoded) => {
            if (err) {
                callback(false); //staff check failed
            } else {
                callback(true); //staff token valid
            }
        });
    }

    checkUser(token);
}

// This function returns a middleware function
const protectPath = function (regex) {
    return function (req, res, next) {
        if (!regex.test(req.url)) {
            return next();
        }

        userIsAllowed(req, function (allowed) {
            if (allowed) {
                next(); // send the request to the next handler, which is express.static
            } else {
                res.end('You do not have permission to view this file!');
            }
        });
    };
};

// Routers
const forumParentCreateRouter = require('./routes/api/forums/parent/create');
const forumParentRemoveRouter = require('./routes/api/forums/parent/remove');
const forumParentListRouter = require('./routes/api/forums/parent/list');
const forumParentRestoreRouter = require('./routes/api/forums/parent/restore');

const forumChildCreateRouter = require('./routes/api/forums/child/create');
const forumChildRemoveRouter = require('./routes/api/forums/child/remove');
const forumChildListRouter = require('./routes/api/forums/child/list');
const forumChildRestoreRouter = require('./routes/api/forums/child/restore');

const sectionCreateRouter = require('./routes/api/sections/create');
const sectionEditRouter = require('./routes/api/sections/edit');
const sectionRemoveRouter = require('./routes/api/sections/remove');
const sectionListRouter = require('./routes/api/sections/list');
const sectionMoveRouter = require('./routes/api/sections/move');
const sectionRestoreRouter = require('./routes/api/sections/restore');

const userCreateRouter = require('./routes/api/users/create');
const userEditRouter = require('./routes/api/users/edit');
const userRemoveRouter = require('./routes/api/users/remove');
const userListRouter = require('./routes/api/users/list');
const userLoginRouter = require('./routes/api/users/login');
const userResetRouter = require('./routes/api/users/reset');
const userRestoreRouter = require('./routes/api/users/restore');
const userChangeRouter = require('./routes/api/users/change');

const fileListRouter = require('./routes/api/files/list');

const logListRouter = require('./routes/api/logs/list');


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

app.use('/api/forums/parent/create', forumParentCreateRouter);
app.use('/api/forums/parent/remove', forumParentRemoveRouter);
app.use('/api/forums/parent/list', forumParentListRouter);
app.use('/api/forums/parent/restore', forumParentRestoreRouter);

app.use('/api/forums/child/create', forumChildCreateRouter);
app.use('/api/forums/child/remove', forumChildRemoveRouter);
app.use('/api/forums/child/list', forumChildListRouter);
app.use('/api/forums/child/restore', forumChildRestoreRouter);

app.use('/api/sections/create', sectionCreateRouter);
app.use('/api/sections/edit', sectionEditRouter);
app.use('/api/sections/remove', sectionRemoveRouter);
app.use('/api/sections/list', sectionListRouter);
app.use('/api/sections/move', sectionMoveRouter);
app.use('/api/sections/restore', sectionRestoreRouter);

app.use('/api/users/create', userCreateRouter);
app.use('/api/users/edit', userEditRouter);
app.use('/api/users/remove', userRemoveRouter);
app.use('/api/users/list', userListRouter);
app.use('/api/users/login', userLoginRouter);
app.use('/api/users/reset', userResetRouter);
app.use('/api/users/restore', userRestoreRouter);
app.use('/api/users/change', userChangeRouter);

app.use('/api/files/list', fileListRouter);

app.use('/api/logs/list', logListRouter);

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
