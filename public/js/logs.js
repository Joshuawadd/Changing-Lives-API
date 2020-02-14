var moment;

class Log {
    constructor(id=0,userId=0,userName='', date='', time = '', action='',entity='') {
        this.id = id;
        this.userId = userId;
        this.date = date;
        this.time = time;
        this.action = action;
        this.entity = entity;
        this.userName = userName;
    }

    listHTML() {
        return `<tr>
                    <td scope="row">${this.date}</td>
                    <td>${this.time}</td>
                    <td>${this.userName}</td>
                    <td>${this.action +' '+ this.entity}</td>
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
                                <label for="log_action" class="form-check-label">Actions:</label>
                                <input type="checkbox" class="form-check ml-2" id="log_action">
                            </div>
                        </div>
                    </div>
                    <label for="log_datetime" class="form-label ml-5">Date Range:</label>
                    <div id="log_datetime" class = "ml-2" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc;">
                        <i class="fa fa-calendar"></i>
                        <span></span> 
                        <i class="fa fa-caret-down"></i>
                    </div>
                </form><br>`;

async function logsClick(event) { //this is the event that triggers when the users tab is clicked on
    event.preventDefault();
    let logs = [new Log(0,12,'abcd12','2020-20-02','12:46:08','list','sections'),new Log(0,17,'quds38','2020-22-02','19:46:08','login','users')];//await getLogs(100);
    if (logs) {
        let topHTML = formHTML;
        let logsHTML =  `<table class="table">
                            <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Time</th>
                                <th scope="col">User</th>
                                <th scope="col">Action</th>
                            </tr>
                            </thead>
                            <tbody id="log_body">`;
        for (var i = 0; i < logs.length; i++) {
            logsHTML += logs[i].listHTML();
        }
        logsHTML += '</tbody> </table>';
        document.getElementById('top_content').innerHTML = topHTML;
        document.getElementById('main_content').innerHTML = logsHTML;
        bindDater();
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
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logs').addEventListener('click', logsClick );
});