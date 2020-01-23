require('dotenv').config();

const express = require('express');
const path = require('path');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/api/login');
const sectionsRouter = require('./routes/api/sections');

const app = express();
const PORT = 3000;

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
