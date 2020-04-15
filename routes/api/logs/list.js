const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const Joi = require('joi');

function validate(req) {
    const schema = {
        search: Joi.string().allow('').max(31),
        uname: Joi.string().allow('').max(31),
        ename: Joi.string().allow('').max(31),
        action: Joi.string().allow('').max(31),
        entity: Joi.string().allow('').max(31),
        sdate: Joi.string().allow('').max(31),
        edate: Joi.string().allow('').max(31),
        token: Joi.optional()
    };
    return Joi.validate(req, schema);
}

/*returns a list of all sections ordered by the position variable*/

class Log { //the class for a log object
    constructor(id = 0, userId = 0, userName = '', date = '', time = '', action = '', entity = '', data = {}) {
        this.id = id;
        this.userId = userId;
        this.date = date;
        this.time = time;
        this.action = action;
        this.entity = entity;
        this.userName = userName;
        this.data = data;
    }
}

function compare(a, b) { //sort by date
    if (a.date + a.time > b.date + b.time) {
        return -1;
    }
    if (a.date + a.time < b.date + b.time) {
        return 1;
    }
    return 0;
}

router.get('/', (req, res) => {
    const {error} = validate(req.query);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).send(errorMessage);
        return;
    }
    try {
        function verify() {
            return new Promise((resolve) => {
                resolve(utils.tokenVerify(req.query.token), true);
            });
        }

        verify().then((userId) => {
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const search = req.query.search;
            const userName = req.query.uname;
            const entityName = req.query.ename;
            var action = req.query.action;
            var entity = req.query.entity;
            const startDate = req.query.sdate;
            const endDate = req.query.edate;
            let uSrch = '%';
            let enSrch = '%';
            let andOr = '-';
            if (userName === 'true') {
                uSrch = '%' + search + '%';
                andOr = '*';
            }
            if (entityName === 'true') {
                enSrch = '%' + search + '%';
                if (andOr === '*') {
                    andOr = 'OR';
                }
            }
            if (andOr !== 'OR') {
                andOr = 'AND';
            }
            if (action === 'All') {
                action = '';
            }
            if (entity === 'All') {
                entity = '';
            }
            action = '%' + action + '%';
            entity = '%' + entity + '%';
            const queryString = `SELECT logs.logId, logs.userId, logs.dateTime, logs.action, logs.entity, logs.oldData, users.username 
            FROM logs LEFT JOIN users ON logs.userId = users.user_id WHERE users.username LIKE BINARY ? ${andOr} JSON_EXTRACT(oldData, '$."name"') LIKE ? AND logs.action LIKE ? AND logs.entity LIKE ?`;

            utils.mysql_query(res, queryString, [uSrch, enSrch, action, entity], (results, res) => {
                let logData = results;
                let logs = [];
                for (let i = 0; i < logData.length; i++) {
                    let dt = logData[i].dateTime.toISOString();
                    let date = dt.slice(0, 10);
                    let time = dt.slice(11, 19);
                    let ndt = date + ' ' + time;
                    if (startDate === '' || (ndt >= startDate && ndt <= endDate)) {
                        logs.push(new Log(logData[i].logId, logData[i].userId, logData[i].username, date, time, logData[i].action, logData[i].entity, logData[i].oldData))
                    }
                }
                logs.sort(compare);
                res.status(200).send(logs);
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;