require('dotenv').config();

const express = require('express');
const path = require('path');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/api/login');
const sectionsRouter = require('./routes/api/sections');

//TOPIC Routers
const topicParentCreateRouter = require('./routes/api/topics/parent/create');
const topicParentRemoveRouter = require('./routes/api/topics/parent/remove');
const topicParentListRouter = require('./routes/api/topics/parent/list');

const topicChildCreateRouter = require('./routes/api/topics/child/create');
const topicChildRemoveRouter = require('./routes/api/topics/child/remove');
const topicChildListRouter = require('./routes/api/topics/child/list');

const sectionCreateRouter = require('./routes/api/sections/create');
const sectionRemoveRouter = require('./routes/api/sections/remove');
const sectionListRouter = require('./routes/api/sections/list');

const userCreateRouter = require('./routes/api/users/create');
const userRemoveRouter = require('./routes/api/users/remove');
const userListRouter = require('./routes/api/users/list');

const fileListRouter = require('./routes/api/files/list');

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

app.use('/api/topic/parent/create', topicParentCreateRouter);
app.use('/api/topic/parent/remove', topicParentRemoveRouter);
app.use('/api/topic/parent/list', topicParentListRouter);

app.use('/api/topic/child/create', topicChildCreateRouter);
app.use('/api/topic/child/remove', topicChildRemoveRouter);
app.use('/api/topic/child/list', topicChildListRouter);

app.use('/api/section/create', sectionCreateRouter);
app.use('/api/section/remove', sectionRemoveRouter);
app.use('/api/section/list', sectionListRouter);

app.use('/api/user/create', userCreateRouter);
app.use('/api/user/remove', userRemoveRouter);
app.use('/api/user/list', userListRouter);

app.use('/api/file/list', fileListRouter);

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
