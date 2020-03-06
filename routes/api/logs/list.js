const express = require('express');
const router = express.Router();
const utils = require('../../../utils');

/*returns a list of all sections ordered by the position variable*/

class Log { //the class for a log object
    constructor(id=0,userId=0,userName='', date='', time = '', action='',entity='', data={}) {
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
    if (a.date+a.time > b.date+b.time) {
        return -1;
    }
    if (a.date+a.time < b.date+b.time) {
        return 1;
    }
    return 0;
}

router.get('/', (req, res) => {
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
            const action = req.query.action;
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
            if (andOr != 'OR') {
                andOr = 'AND';
            }
            const queryString = `SELECT logs.logId, logs.userId, logs.dateTime, logs.action, logs.entity, logs.oldData, users.username 
            FROM logs LEFT JOIN users ON logs.userId = users.user_id WHERE users.username LIKE BINARY ? ${andOr} JSON_EXTRACT(oldData, '$."name"') LIKE ?`;
            
            utils.mysql_query(res, queryString, [uSrch,enSrch], (results, res) => {
                let logData = results;
                let logs = [];
                for (let i = 0; i < logData.length; i++) {
                    let dt = logData[i].dateTime.toISOString();
                    let date = dt.slice(0,10);
                    let time = dt.slice(11,19);
                    let ndt = date+' '+time;
                    if (startDate === '' ||(ndt >= startDate && ndt <= endDate)) {
                        logs.push(new Log(logData[i].logId, logData[i].userId,logData[i].username, date, time, logData[i].action, logData[i].entity, logData[i].oldData))
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