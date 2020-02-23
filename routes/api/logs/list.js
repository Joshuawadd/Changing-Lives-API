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
            /*
            let sectionId = parseInt(req.query.sectionId, 10);
            if ( (typeof(sectionId) === 'undefined') || (isNaN(sectionId)) ) {
                sectionId = 'All';
            }

            var whereString = '';
            if (sectionId !== 'All') {
                whereString = `WHERE sections.section_id = ${sectionId}`;
            }*/
            const queryString = `SELECT logs.logId, logs.userId, logs.dateTime, logs.action, logs.entity, logs.oldData, users.username 
            FROM logs LEFT JOIN users ON logs.userId = users.user_id`;
            
            utils.mysql_query(res, queryString, [], (results, res) => {
                let logData = results;
                let logs = [];
                for (let i = 0; i < logData.length; i++) {
                    let dt = logData[i].dateTime.toISOString();
                    let date = dt.slice(0,10);
                    let time = dt.slice(11,19);
                    logs.push(new Log(logData[i].logId, logData[i].userId,logData[i].username, date, time, logData[i].action, logData[i].entity, logData[i].oldData));
                }
                res.status(200).send(logs);
            });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;