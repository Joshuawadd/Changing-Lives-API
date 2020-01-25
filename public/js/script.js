//load the bootstrap login box when the site loads
$(window).on('load',function(){
    loginPrompt();
});
var sections = [];
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
        $('.modal').modal('hide');
        let authToken = getCookie('authToken');
        let response = await fetch('/api/login/silent?token='+authToken);
        if (response.ok) {
            return true;
        } else {
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
                    <span class="badge badge-dark"><a href="#" id="rmve_btn_${this.id}">Remove</a></span>
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
                    <span class="badge badge-dark"><a href="#" id="rmve_btn_${this.id}">Delete</a></span>
                </li>`;
    }
}
var users = [new User(0,'User 1','username1','password1'),new User(1,'User 2','username2','password2'),new User(2,'User 3','username3','password3')];

//REST FUNCTIONS
async function getSections() {
    try {
        let authToken = getCookie('authToken');
        let response = await fetch('/api/section/list?token='+authToken);
        if (response.ok) {
            let body = await response.text();
            let contentData = JSON.parse(body);
            let sects = [];
            for (var i = 0; i < contentData.length; i++) {
                let sc = new Section(contentData[i].id,contentData[i].name,contentData[i].text,contentData[i].position,contentData[i].files);
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

async function addSection(event) { //in fact this can also edit a section it seems
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
        for (var k = 0; k < sections.length; k++) {
            if (sections[k].id == currentSection) {
                var fileList = sections[k].files;
            }
        }
        let len = fileList.length + fileLimbo.length;
        for (var j = 0; j < len; j++) {//update the display titles of all files
            fileList.push([document.getElementById(`file_title${j}`).value,'']);
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
            alert(response.status + ' ' + response.statusText);
            $('#section_modal').modal('hide');
            return true;
        } else if (response.status === 403){
            alert('Your session may have expired - please log in.');
            await loginPrompt();
            $('#section_modal').modal('show');
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
        event.preventDefault();
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
    document.getElementById('section_text').innerText = '';
    document.getElementById('file_box_list').innerHTML = '';
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
                        <input name="file_title" id ="file_title${j}" type="text" class="form-control" placeholder="Display Title" required value="${fileList[j][0]}"> 
                        <div class="input-group-append">
                            <button class="btn btn-success" type="button" id="file_view${j}" onclick="function() {window.open('./${fileList[j][1]}?token=${getCookie('authToken')}','_blank');}">View</button>
                        </div>
                        <div class="input-group-append">
                            <button class="close" type="button" id="file_delete${j}">&times;</button>
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
                        <input name="file_title" id ="file_title${i}" type="text" class="form-control" required placeholder="Display Title"> 
                        <div class="input-group-append">
                            <button class="btn btn-success" type="button" id="file_view${i} disabled>View</button>
                        </div>
                        <div class="input-group-append">
                            <button class="close" type="button" id="file_delete${i}" onclick="removeFile(${i},true)">&times;</button>
                        </div>
                    </div>`;
    }
    document.getElementById('file_box_list').innerHTML = display;
}
function removeFile(filePos, limbo) { //limbo is a bool true if the file is not yet on the server, false otherwise
    if (limbo) {
        for (var k = 0; k < sections.length; k++) {
            if (sections[k].id == currentSection) {
                var fileList = sections[k].files;
            }
        }
        let ind = filePos - fileList.length;
        fileLimbo.splice(ind,1);
        refreshFileList();
    }
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

function userClick(event) { //this is the event that triggers when the users tab is clicked on
    event.preventDefault();
    let usersHTML = '<h3>User List</h3> <button type="button" class="btn btn-outline-dark btn-sm" onclick="newUser()">New User</button><br><div class="list-group">';
    for (var i = 0; i < users.length; i++) {
        usersHTML += users[i].listHTML();
    }
    usersHTML += '</div>';
    document.getElementById('main_content').innerHTML = usersHTML;
}

function newUser() { //this loads up the box for creating a new user
    document.getElementById('user_edit_title').innerText = 'New User';
    document.getElementById('user_name').value = '';
    document.getElementById('user_username').value = '';
    document.getElementById('user_password').value = '';
    $('#user_modal').modal('show');
}

function editUser(event,userId) { //this loads up the box for editing a user's details
    event.preventDefault();
    document.getElementById('user_edit_title').innerText = 'Edit user details';
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == userId) {
            document.getElementById('user_name').value = users[i].name;
            document.getElementById('user_username').value = users[i].username;
            document.getElementById('user_password').value = users[i].password;
        }
    }
    $('#user_modal').modal('show');
}

document.addEventListener('DOMContentLoaded', function() { //set up listeners
    document.getElementById('login_form').addEventListener('submit', logIn );
    document.getElementById('edit_section').addEventListener('submit', function(event) {
        if (currentSection == -1) {
            addSection(event);
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