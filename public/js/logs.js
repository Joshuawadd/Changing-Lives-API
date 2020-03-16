var moment;
var getCookie;
var loginPrompt;

var logsList;

class Log {
    constructor(id=0,userId=0,userName='', date='', time = '', action='',entity='', data={}) {
        this.id = id;
        this.userId = userId;
        this.date = date;
        this.time = time;
        this.action = action;
        this.entity = entity;
        this.userName = userName;
        this.data = data||{'name': 'NULL'};
    }

    listHTML() {
        let nm = this.data.name;
        if (this.data.name.length >= 10) {
            nm = this.data.name.slice(0,10) + '...';
        }
        return `<tr>
                    <td scope="row">${this.date}</td>
                    <td>${this.time}</td>
                    <td>${this.userName}</td>
                    <td>${this.action +' '+ this.entity}(${nm})</td>
                </tr>`;
    }
}

const formHTML = `<form class="form-inline" action="">
                    <span class="input-group-text ml-3" style="height: 38px;"><i class="fa fa-search"></i></span>
                    <input type="search" class="form-control mr-4" placeholder="Search" id="log_search">
                    <div class="ml-2 mr-5">
                        <div class="row">
                            <div class="form-check ml-2">
                                <label for="log_username" class="form-check-label">Usernames:</label>
                                <input type="checkbox" class="form-check ml-2" id="log_username" checked>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-check ml-2 mr-5">
                                <label for="log_action" class="form-check-label">Data:</label>
                                <input type="checkbox" class="form-check ml-2" id="log_action">
                            </div>
                        </div>
                    </div>
                    <label for="action_list">Action:</label>
                    <select class="form-control ml-2 mr-3" id="action_list">
                        <option>All</option>
                        <option>CREATE</option>
                        <option>REMOVE</option>
                        <option>RESTORE</option>
                        <option>EDIT</option>
                        <option>RESET</option>
                        <option>LOGIN</option>
                    </select>
                    <label for="entity_list">Entity:</label>
                    <select class="form-control ml-2 mr-3" id="entity_list">
                        <option>All</option>
                        <option>SECTION</option>
                        <option>USER</option>
                        <option>POST</option>
                        <option>COMMENT</option>
                    </select>
                    <label for="log_datetime" class="form-label ml-2">Date Range:</label>
                    <div id="log_datetime" class = "ml-2" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc;">
                        <i class="fa fa-calendar"></i>
                        <span></span> 
                        <i class="fa fa-caret-down"></i>
                    </div>
                </form><br>`;

async function getLogs() {
    try {
        let authToken = getCookie('authToken');
        let srch = '';
        let uname = '';
        let ename = '';
        let sdate = '';
        let edate = '';
        let action = 'All';
        let entity = 'All';
        if (document.getElementById('log_search') != null) {
            srch = document.getElementById('log_search').value;
            uname = document.getElementById('log_username').checked;
            ename = document.getElementById('log_action').checked;
            sdate = $('#log_datetime').data('daterangepicker').startDate.format('YYYY-MM-DD HH:mm:ss');
            edate = $('#log_datetime').data('daterangepicker').endDate.format('YYYY-MM-DD HH:mm:ss');
            action = document.getElementById('action_list').value;
            entity = document.getElementById('entity_list').value;
        }
        let response = await fetch('/api/logs/list?token='+authToken+'&search='+srch+'&uname='+uname+'&ename='+ename+'&sdate='+sdate+'&edate='+edate+'&action='+action+'&entity=' + entity);
        if (response.ok) {
            let body = await response.text();
            let logData = JSON.parse(body);
            let logs = [];
            for (var i = 0; i < logData.length; i++) {
                let lg = new Log(logData[i].id,logData[i].userId,logData[i].userName,logData[i].date,logData[i].time,logData[i].action,logData[i].entity,JSON.parse(logData[i].data));
                logs.push(lg);
            }
            return logs;
        } else if (response.status === 403) {
            alert('Your session may have expired - please log in.');
            loginPrompt();
            return false;
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function restore() {
    try {
        let lg = logsList[currentLog];
        var response = null;
        if (lg.entity == 'USER') { //restore a deleted user
            response = await fetch('/api/users/restore',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': getCookie('authToken'),
                    },
                    body: 'realName=' + lg.data.nickname + '&username=' + lg.data.name + '&password=' + lg.data.password + '&salt=' + lg.data.passwordSalt + '&isAdmin=' + lg.data.isAdmin
                });
        } else if (lg.entity == 'SECTION') { //restore a deleted section
            let files = [];
            for (var i = 0; i < lg.data.files.length; i++) { //add all the files back
                files.push(lg.data.files[i]);
            }
            response = await fetch('/api/sections/restore',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': getCookie('authToken'),
                    },
                    body: 'sectionName=' + lg.data.name + '&sectionText=' + lg.data.text + '&sectionFiles=' + JSON.stringify(files)
                });
        } else if (lg.entity == 'COMMENT') {
            response = await fetch('/api/forums/child/restore',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': getCookie('authToken'),
                    },
                    body: 'creatorId=' + lg.data.userId + '&parentId=' + lg.data.parentId + '&childComment=' + lg.data.name
                });
        } else if (lg.entity == 'POST') {
            response = await fetch('/api/forums/parent/restore',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': getCookie('authToken'),
                    },
                    body: 'parentId=' + lg.data.id + '&creatorId=' + lg.data.userId + '&parentTitle=' + lg.data.name + '&parentComment=' + lg.data.comment
                });
        }
        if (response.ok) {
            document.getElementById('restore_button').style.cursor = '';
            document.getElementById('logs').click();
            alert('Restored successfully!');
            $('#log_modal').modal('hide');
        } else if (response.status === 403) {
            document.getElementById('restore_button').style.cursor = '';
            alert('Your session may have expired - please log in.');
            loginPrompt();
        } else {
            document.getElementById('restore_button').style.cursor = '';
            let text = await response.text();
            throw new Error(response.status+' '+text);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function logsClick(event, topRefresh) { //this is the event that triggers when the users tab is clicked on
    event.preventDefault();
    logsList = await getLogs();
    if (logsList) {
        let topHTML = formHTML;
        let logsHTML =  `<table class="table" id="log_table">
                            <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Time</th>
                                <th scope="col">User</th>
                                <th scope="col">Action</th>
                            </tr>
                            </thead>
                            <tbody id="log_body">`;
        for (var i = 0; i < logsList.length; i++) {
            logsHTML += logsList[i].listHTML();
        }
        logsHTML += '</tbody> </table>';
        if (topRefresh) {
            document.getElementById('top_content').innerHTML = topHTML;
            document.getElementById('log_search').addEventListener('input', function(event) {
                logsClick(event,false); 
            });
            bindDater();
            $('#log_datetime').on('apply.daterangepicker', function(ev, picker) {
                logsClick(ev, false);
            });
            document.getElementById('action_list').addEventListener('input', function(event) {
                if (document.getElementById('action_list').value == ('LOGIN') || document.getElementById('action_list').value == ('RESET')) {
                    document.getElementById('entity_list').value = 'USER';
                }
                logsClick(event,false); 
            });
            document.getElementById('entity_list').addEventListener('input', function(event) {
                logsClick(event,false); 
            });
            
        }
        document.getElementById('main_content').innerHTML = logsHTML;
        $('#log_table').on('click', 'tr', function(e) {
            rowClick(e,$(e.currentTarget).index());
        });
    }
}

function bindDater() {

    var start = moment().subtract(29, 'days');
    var end = moment();

    function cb(start, end) {
        $('#log_datetime span').html(start.format('DD-MM-YY HH:mm') + ' - ' + end.format('DD-MM-YY HH:mm'));
    }

    $('#log_datetime').daterangepicker({
        timePicker: true,
        timePicker24Hour: true,
        startDate: start,
        endDate: end,
        ranges: {
            'Today': [moment().startOf('day'), moment()],
            'Yesterday': [moment().startOf('day').subtract(1, 'days'), moment().startOf('day')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);
}
var currentLog = -1;
function rowClick(event, row) {
    event.preventDefault();
    currentLog = row;
    let lg = logsList[row];
    let dt = `<p>${lg.entity[0] + lg.entity.toLowerCase().slice(1,lg.entity.length)}: ${lg.data.name}</p>`;
    document.getElementById('restore_button').disabled = true;
    if (lg.action === 'REMOVE' || lg.action === 'EDIT') {
        document.getElementById('restore_button').disabled = false;
        dt = '<h4>Previous ' + lg.entity.toLowerCase() + ':</h4>';
        Object.keys(lg.data).forEach(e => {if(e!=='id' &&e!='password'&&e!='passwordSalt'&&e!=='position'&&isNaN(lg.data[e])){
            if (typeof(lg.data[e]) !== 'object') {
                dt += `${e[0].toUpperCase() + e.slice(1,e.length)}: ${lg.data[e]}<br>`;
            } else {
                dt += `${e[0].toUpperCase() + e.slice(1,e.length)}:<br>`;
                for (var i = 0; i < lg.data[e].length; i++) {
                    dt += `&nbsp&nbsp&nbsp${lg.data[e][i].title}<br>`;
                }
            }
        }
        });
    }
    document.getElementById('log_details').innerHTML = `<p> Date: ${lg.date} ${lg.time} </p><p>User: ${lg.userName} </p>
    <p>Action: ${lg.action} ${lg.entity} </p> ${dt} <br>`;
    $('#log_modal').modal('show');

}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logs').addEventListener('click', (event) => {
        logsClick(event, true);
    });
    document.getElementById('restore_button').addEventListener('click', (e) => {
        let sec = document.getElementById('restore_button');
        if (sec.style.cursor == '') {
            sec.style.cursor = 'wait';
            restore();
        }
    });
});