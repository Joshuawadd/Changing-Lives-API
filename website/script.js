//load the bootstrap login box when the site loads
$(window).on('load',function(){
    $('#login_box').modal('show');
});

function logIn(event) { //the login function currently only hides the login box
    event.preventDefault();
    $('#login_box').modal('hide');
}

class Section {
    constructor(id=0,name = '',text='No text added') {
        this.id = id;
        this.name = name;
        this.text = text;
    }

    listHTML() {
        return `<li class="list-group-item list-group-item-action"><h4>${this.name}</h4>
                    <span class="badge badge-dark"><a href="#" id="edit_btn_${this.id}">Edit</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvup_btn_${this.id}">Move Up</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvdn_btn_${this.id}">Move Down</a></span>
                    <span class="badge badge-dark"><a href="#" id="rmve_btn_${this.id}">Remove</a></span>
                </li>`;
    }
}

function contentClick(event) {
    event.preventDefault();
    let sections = [new Section(0,'Section 1','Here is some text about S1'),new Section(1,'Section 2','Here is some text about S2')];
    let sectionsHTML = '<h3>Content Editor</h3> <div class="list-group">';
    for (var i = 0; i < sections.length; i++) {
        sectionsHTML += sections[i].listHTML();
    }
    sectionsHTML += '</div>';
    document.getElementById('main_content').innerHTML = sectionsHTML;
    //the code for loading the content modification area goes here
}

function userClick(event) {
    event.preventDefault();

    document.getElementById('main_content').innerHTML = '<p>The user area is loaded</p>';
    //the code for loading the user modification area goes here
}

document.addEventListener('DOMContentLoaded', function() { //set up listeners
    document.getElementById('login_form').addEventListener('submit', logIn );
    document.getElementById('users').addEventListener('click', userClick );
    document.getElementById('content').addEventListener('click', contentClick );
});