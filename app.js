const createError = require('http-errors');
const express = require('express');
const path = require('path');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/api/login');
const registerRouter = require('./routes/api/register');

const app = express();
const PORT = 3000;

//This will be used on top of other salts as apparently it is more secure
const GLOBAL_SALT = 'A SALT KEY';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
