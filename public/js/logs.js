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
async function logsClick(event) { //this is the event that triggers when the users tab is clicked on
    event.preventDefault();
    let logs = [new Log(0,12,'abcd12','2020-20-02','12:46:08','list','sections'),new Log(0,17,'quds38','2020-22-02','19:46:08','login','users')];//await getLogs(100);
    if (logs) {
        let logsHTML = `<table class="table">
                            <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Time</th>
                                <th scope="col">User</th>
                                <th scope="col">Action</th>
                            </tr>
                            </thead>
                            <tbody id="log_body">'`;
        for (var i = 0; i < logs.length; i++) {
            logsHTML += logs[i].listHTML();
        }
        logsHTML += '</tbody> </table>';
        console.log(logsHTML);
        document.getElementById('main_content').innerHTML = logsHTML;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logs').addEventListener('click', logsClick );
});