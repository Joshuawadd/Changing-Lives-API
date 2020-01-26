//load the bootstrap login box when the site loads
$(window).on('load',function(){
    loginPrompt();
});
var sections = [];
var users = [];
function getCookie(cname) { //adapted from https://www.w3schools.com/js/js_cookies.asp
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
async function loginPrompt() {
    try {
        let authToken = getCookie('authToken');
        let response = await fetch('/api/login/silent?token='+authToken);
        if (response.ok) {
            return true;
        } else {
            $('.modal').modal('hide');
            $('#login_box').modal('show');
            return false;
        }
    }
    catch(error) {
        console.log(error);
    }
}

async function logIn(event) { //sends a login request and sets the authToken cookie if successful
    try {
        event.preventDefault();
        let uname = document.getElementById('username').value;
        let pass = document.getElementById('password').value;
        let response = await fetch('/api/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'username=' + uname + '&password=' + pass
            });
        if (response.ok) {
            $('#login_box').modal('hide');
            let authToken = await response.text();
            document.cookie = 'authToken=' + authToken;
        }
        else {
            throw new Error(response.status);
        }
    } catch(error) {
        alert('Incorrect Username and/or Password');
    }
}
//CLASSES

class Section { //this is the class for an app section or page
    constructor(id=0,name = '',text='No text added',position=0, files = [['title','path']]) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position =position;
        this.files = files;
    }

    listHTML() {
        return `<li class="list-group-item"><h4>${this.name}</h4>
                    <span class="badge badge-dark"><a href="#" id="edit_btn_${this.id}" onclick="editSection(event,${this.id});">Edit</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvup_btn_${this.id}">Move Up</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvdn_btn_${this.id}">Move Down</a></span>
                    <span class="badge badge-dark"><a href="#" id="rmve_btn_${this.id}" onclick="rmSection(event,${this.id},'${this.name}');">Remove</a></span>
                </li>`;
    }
}
var currentSection = -1;
class User {
    constructor(id=0,name='',username='',password='') {
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
    }

    listHTML() {
        return `<li class="list-group-item"><h4 class="user-list-title">${this.name}</h4> : ${this.username}
                    <span class="badge badge-dark"><a href="#" id="edit_btn_${this.id}" onclick="editUser(event,${this.id});">Edit</a></span>
                    <span class="badge badge-dark"><a href="#" id="rmve_btn_${this.id}" onclick="rmUser(event,${this.id},'${this.name}');">Delete</a></span>
                </li>`;
    }
}
var currentUser = -1;

//REST FUNCTIONS
async function getSections() {
    try {
        let authToken = getCookie('authToken');
        let response = await fetch('/api/section/list?token='+authToken);
        if (response.ok) {
            let body = await response.text();
            let contentData = JSON.parse(body);
            let sects = [];
            for (var i = 0; i < contentData.length; i++) { //remember FILES are OBJECTS now
                let fils = [];
                for (var j = 0; j < contentData[i].files.length; j++) {;
                    fils.push([contentData[i].files[j].title,contentData[i].files[j].path]);
                }
                let sc = new Section(contentData[i].id,contentData[i].name,contentData[i].text,contentData[i].position,fils);
                sects.push(sc);
            }
            return sects;
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

async function addSection(event) {
    try {
        event.preventDefault();
        let authToken = getCookie('authToken');
        let sectionName = document.getElementById('section_name').value;
        let sectionText = document.getElementById('section_text').value;
        let data = new FormData();
        for (var i = 0; i < fileLimbo.length; i++) { //add all the unadded files
            data.append('section_files[]', fileLimbo[i]);
        }
        data.append('sectionName', sectionName);
        data.append('sectionText', sectionText);
        //data.append('sectionId', currentSection); not required for new sections
        fileList = [];
        let len = fileLimbo.length;
        for (var j = 0; j < len; j++) {//update the display titles of all files
            fileList.push(document.getElementById(`file_title${j}`).value);
        }
        data.append('fileTitles', JSON.stringify(fileList));
        let response = await fetch('/api/section/create',
            {
                method: 'POST',
                headers: {
                    'Authorisation': authToken,
                },
                body: data
            });
        if (response.ok) {
            alert('Section added successfully!');
            $('#section_modal').modal('hide');
            fileLimbo = [];
            document.getElementById('file_adder').value = '';
            document.getElementById('file_adder_label').innerText = 'Choose file(s)';
            document.getElementById('content').click();
            return true;
        } else if (response.status === 403){
            alert('Your session may have expired - please log in.');
            await loginPrompt();
            $('.modal').modal('hide');
            $('#section_modal').modal('show');
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function updateSection(event) {
    event.preventDefault();
    try {
        let authToken = getCookie('authToken');
        let sectionName = document.getElementById('section_name').value;
        let sectionText = document.getElementById('section_text').value;
        let data = new FormData();
        for (var i = 0; i < fileLimbo.length; i++) { //add all the unadded files
            data.append('section_files[]', fileLimbo[i]);
        }
        data.append('sectionName', sectionName);
        data.append('sectionText', sectionText);
        data.append('sectionId', currentSection);
        fileList = [];
        for (var k = 0; k < sections.length; k++) {
            if (sections[k].id == currentSection) {
                var fileList = sections[k].files;
            }
        }
        let len = fileList.length + fileLimbo.length;
        fileList = []
        for (var j = 0; j < len; j++) {//update the display titles of all files
            fileList.push(document.getElementById(`file_title${j}`).value);
        }
        data.append('fileTitles', JSON.stringify(fileList));
        let response = await fetch('/api/section/edit',
            {
                method: 'POST',
                headers: {
                    'Authorisation': authToken,
                },
                body: data
            });
        if (response.ok) {
            alert('Section edited successfully!');
            $('#section_modal').modal('hide');
            document.getElementById('content').click();
            fileLimbo = [];
            document.getElementById('file_adder').value = '';
            document.getElementById('file_adder_label').innerText = 'Choose file(s)';
            return true;
        } else if (response.status === 403){
            alert('Your session may have expired - please log in.');
            await loginPrompt();
            $('.modal').modal('hide');
            $('#section_modal').modal('show');
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function rmSection(event, sec_id, sec_name) {
    try {
        event.preventDefault();
        if (window.confirm(`Are you sure you want to remove the section: ${sec_name}?`)) {
            let response = await fetch('/api/section/remove',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorisation': getCookie('authToken'),
                    },
                    body: 'section_id=' + sec_id
                });
            if (response.ok) {
                alert('Section removed successfully!');
                document.getElementById('content').click();
            } else if (response.status === 403){
                alert('Your session may have expired - please log in.');
                loginPrompt();
            } else {
                throw new Error(response.status+' '+response.statusText);
            }
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function rmUser(event, u_id, username) {
    try {
        event.preventDefault();
        if (window.confirm(`Are you sure you want to remove the user: ${username}?`)) {
            let response = await fetch('/api/user/remove',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorisation': getCookie('authToken'),
                    },
                    body: 'user_id=' + u_id
                });
            if (response.ok) {
                alert('User deleted successfully!');
                document.getElementById('users').click();
            } else if (response.status === 403){
                alert('Your session may have expired - please log in.');
                loginPrompt();
            } else {
                throw new Error(response.status+' '+response.statusText);
            }
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function getUsers() {
    try {
        let authToken = getCookie('authToken');
        let response = await fetch('/api/user/list?token='+authToken);
        if (response.ok) {
            let body = await response.text();
            let userData = JSON.parse(body);
            let usrs = [];
            for (var i = 0; i < userData.length; i++) {
                let usr = new User(userData[i].id,userData[i].name,userData[i].username,userData[i].password);
                usrs.push(usr);
            }
            return usrs;
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

async function updateUser(event) {
    event.preventDefault();
    try {
        let authToken = getCookie('authToken');
        let userName = document.getElementById('user_name').value;
        let userUname = document.getElementById('user_username').value;
        let userPass = document.getElementById('user_password').value;
        let data = new FormData();
        data.append('userName', userName);
        data.append('userUname', userUname);
        data.append('userPass', userPass);
        data.append('userId', currentUser);
        let response = await fetch('/api/user/edit',
            {
                method: 'POST',
                headers: {
                    'Authorisation': authToken,
                },
                body: data
            });
        if (response.ok) {
            alert('User details edited successfully!');
            $('#user_modal').modal('hide');
            document.getElementById('users').click();
            return true;
        } else if (response.status === 403){
            alert('Your session may have expired - please log in.');
            await loginPrompt();
            $('.modal').modal('hide');
            $('#user_modal').modal('show');
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function addUser(event) {
    event.preventDefault();
    try {
        let authToken = getCookie('authToken');
        let userName = document.getElementById('user_name').value;
        let response = await fetch('/api/user/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorisation': authToken,
                },
                body: 'real_name=' + userName + '&is_admin=0'
            });
        if (response.ok) {
            alert('User created successfully!');
            $('#user_modal').modal('hide');
            document.getElementById('users').click();
            return true;
        } else if (response.status === 403){
            alert('Your session may have expired - please log in.');
            await loginPrompt();
            $('.modal').modal('hide');
            $('#user_modal').modal('show');
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

//LISTENER FUNCTIONS

async function contentClick(event) { //triggers when the content tab is clicked on
    //the code for loading the content modification area goes here
    event.preventDefault();
    sections = await getSections();
    if (sections) {
        //build the section HTML (my intent is for the position class variable to be position in the list as well to make this easier)
        let sectionsHTML = '<h3>Content Editor</h3> <button type="button" class="btn btn-outline-dark btn-sm" onclick="newSection()">New Section</button><br><div class="list-group">';
        for (var i = 0; i < sections.length; i++) {
            sectionsHTML += sections[i].listHTML();
        }
        sectionsHTML += '</div>';
        //set it to display
        document.getElementById('main_content').innerHTML = sectionsHTML;
    }
}

function newSection() { //this loads up the box for creating a new section
    document.getElementById('section_edit_title').innerText = 'New Section';
    document.getElementById('section_name').value = '';
    document.getElementById('section_text').value = '';
    document.getElementById('file_box_list').innerHTML = '';
    fileLimbo = [];
    currentSection = -1; //this signifies to create a new one
    refreshFileList();
    $('#section_modal').modal('show');
}

function editSection(event,sectionId) { //this loads up the box for editing a section
    event.preventDefault();
    document.getElementById('section_edit_title').innerText = 'Edit a section';
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].id == sectionId) {
            document.getElementById('section_name').value = sections[i].name;
            document.getElementById('section_text').innerText = sections[i].text;
        }
    }
    currentSection = sectionId;
    fileLimbo = [];
    refreshFileList();
    $('#section_modal').modal('show');
}


var fileLimbo = []; //stores files 'added' but not yet sent to server
function refreshFileList() { //this function keeps the file list up to date
    let display = '';
    let fileList = [];
    for (var k = 0; k < sections.length; k++) {
        if (sections[k].id == currentSection) {
            fileList = sections[k].files;
        }
    }
    for (var j = 0; j < fileList.length; j++) {
        display += `<div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <div class="ellipsis">
                                <span class="input-group-text" id="file_name${j}">${fileList[j][1]}</span>
                            </div>
                        </div>
                        <input name="file_title" id ="file_title${j}" type="text" class="form-control" placeholder="Display Title" maxlength="20" required value="${fileList[j][0]}"> 
                        <div class="input-group-append">
                            <button class="btn btn-success" type="button" id="file_view${j}" onclick="(function(){window.open('./files/${fileList[j][1]}?token=${getCookie('authToken')}','_blank');})();">View</button>
                        </div>
                        <div class="input-group-append">
                            <button class="close" type="button" id="file_delete${j}" onclick="removeFileDB(${j})">&times;</button>
                        </div>
                    </div>`;
    }
    for (var i = j; i < fileLimbo.length+j; i++) {
        display += `<div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <div class="ellipsis">
                                <span class="input-group-text" id="file_name${i}">${fileLimbo[i-j].name}</span>
                            </div>
                        </div>
                        <input name="file_title" id ="file_title${i}" type="text" class="form-control" required maxlength="20" placeholder="Display Title"> 
                        <div class="input-group-append">
                            <button class="btn btn-success" type="button" id="file_view${i}" disabled>View</button>
                        </div>
                        <div class="input-group-append">
                            <button class="close" type="button" id="file_delete${i}" onclick="removeFile(${i})">&times;</button>
                        </div>
                    </div>`;
    }
    document.getElementById('file_box_list').innerHTML = display;
}
function removeFile(filePos) { //this is for files not yet on the db
    for (var k = 0; k < sections.length; k++) {
        if (sections[k].id == currentSection) {
            var fileList = sections[k].files;
        }
    }
    let ind = filePos - fileList.length;
    fileLimbo.splice(ind,1);
    refreshFileList();
}

function removeFileDB(filePos) {
    alert('does nothing yet');
}

function addFile() { //this adds a file to the list, but does nothing on the server
    let filer = document.getElementById('file_adder');
    for (var i = 0; i < filer.files.length; i++) {
        fileLimbo.push(filer.files.item(i));
    }
    document.getElementById('file_adder').value = '';
    document.getElementById('file_adder_label').innerText = 'Choose file(s)';
    refreshFileList();
}

async function userClick(event) { //this is the event that triggers when the users tab is clicked on
    event.preventDefault();
    users = await getUsers();
    if (users) {
        let usersHTML = '<h3>User List</h3> <button type="button" class="btn btn-outline-dark btn-sm" onclick="newUser()">New User</button><br><div class="list-group">';
        for (var i = 0; i < users.length; i++) {
            usersHTML += users[i].listHTML();
        }
        usersHTML += '</div>';
        document.getElementById('main_content').innerHTML = usersHTML;
    }
}

function newUser() { //this loads up the box for creating a new user
    document.getElementById('user_edit_title').innerText = 'New User';
    currentUser = -1;
    document.getElementById('user_name').value = '';
    document.getElementById('user_username').value = '';
    document.getElementById('user_password').value = '';
    document.getElementById('user_username').required = false;
    document.getElementById('user_password').required = false;
    document.getElementById('user_edit_forms').style.display = 'none';
    $('#user_modal').modal('show');
}

function editUser(event,userId) { //this loads up the box for editing a user's details
    event.preventDefault();
    document.getElementById('user_edit_forms').style.display = 'block';
    document.getElementById('user_username').required = true;
    document.getElementById('user_password').required = true;
    document.getElementById('user_edit_title').innerText = 'Edit user details';
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == userId) {
            document.getElementById('user_name').value = users[i].name;
            document.getElementById('user_username').value = users[i].username;
            document.getElementById('user_password').value = users[i].password;
        }
    }
    currentUser = userId;
    $('#user_modal').modal('show');
}

document.addEventListener('DOMContentLoaded', function() { //set up listeners
    document.getElementById('login_form').addEventListener('submit', logIn );
    document.getElementById('edit_section').addEventListener('submit', function(event) {
        if (currentSection == -1) {
            addSection(event);
        } else if (currentSection >= 0) {
            updateSection(event);
        }
        
    });
    document.getElementById('edit_user').addEventListener('submit', function(event) {
        if (currentUser >= 0) {
            updateUser(event);
        } else if (currentUser == -1) {
            addUser(event);
        }
    });
    document.getElementById('users').addEventListener('click', userClick );
    document.getElementById('content').addEventListener('click', contentClick );
    document.getElementById('file_add').addEventListener('click', addFile );
    document.getElementById('file_adder').addEventListener('change', function() {
        let txt = ' file chosen';
        if (this.files.length != 1) {
            txt = ' files chosen';
        }
        document.getElementById('file_adder_label').innerText = this.files.length + txt;
    });
});