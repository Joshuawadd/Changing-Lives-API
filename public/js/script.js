//load the bootstrap login box when the site loads
$(window).on('load',function(){
    $('#login_box').modal('show');
});

function logIn(event) { //the login function currently only hides the login box
    event.preventDefault();
    $('#login_box').modal('hide');
}
//CLASSES

class Section { //this is the class for an app section or page
    constructor(id=0,name = '',text='No text added',position=0, links = []) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position =position;
        this.links = links;
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
var sections = [new Section(0,'Section 1','Here is some text about S1',0),new Section(1,'Section 2','Here is some text about S2',1)];

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

//LISTENER FUNCTIONS

function contentClick(event) { //triggers when the content tab is clicked on
    //the code for loading the content modification area goes here
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

function newSection() { //this loads up the box for creating a new section
    document.getElementById('section_edit_title').innerText = 'New Section';
    document.getElementById('section_name').value = '';
    document.getElementById('section_text').innerText = '';
    document.getElementById('section_links').innerHTML = `<div class="list-group" id="file_box_list">
                                                            <div class="input-group mb-3">
                                                                <div class="input-group-prepend">
                                                                    <input name="section_link_title" id ="section_link_title0" type="text" class="form-control" placeholder="Link Name">
                                                                </div>
                                                                <input name="section_links" id ="section_links0" type="text" class="form-control" placeholder="Link"> 
                                                                <div class="input-group-append" id="file_append0">
                                                                    <button class="btn btn-success" type="button" id="file_add">More</button>
                                                                </div>
                                                            </div>
                                                        </div>`;
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
    $('#section_modal').modal('show');
}
var file_boxes = 0;
function fileAdd() {
    let newHTML = '';
    for (let i = 0; i <= file_boxes; i++) {
        let prevVal = [document.getElementById(`section_link_title${i}`).value,document.getElementById(`section_links${i}`).value];
        newHTML +=
        `<div class="list-group">
            <div class="input-group mb-3">
                <div class="input-group-prepend">
                    <input name="section_link_title" id ="section_link_title${i}" value="${prevVal[0]}" type="text" class="form-control" placeholder="Link Name"> <!--<span class="input-group-text"><h4>File Link:</h4> </span> -->
                </div>
                <input name="section_links" id ="section_links${i}" value="${prevVal[1]}" type="text" class="form-control" placeholder="Link"> 
            </div>
        </div>`;
    }
    file_boxes += 1;
    newHTML +=
    `<div class="list-group">
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <input name="section_link_title" id ="section_link_title${file_boxes}" type="text" class="form-control" placeholder="Link Name"> <!--<span class="input-group-text"><h4>File Link:</h4> </span> -->
            </div>
            <input name="section_links" id ="section_links${file_boxes}" type="text" class="form-control" placeholder="Link"> 
            <div class="input-group-append" id="file_append${file_boxes}">
                <button class="btn btn-success" type="button" id="file_add">More</button>
            </div>
        </div>
    </div>`;
    document.getElementById('file_box_list').innerHTML = newHTML;
    document.getElementById('file_add').addEventListener('click', fileAdd );
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
    document.getElementById('file_add').addEventListener('click', fileAdd );
    document.getElementById('login_form').addEventListener('submit', logIn );
    document.getElementById('users').addEventListener('click', userClick );
    document.getElementById('content').addEventListener('click', contentClick );
});