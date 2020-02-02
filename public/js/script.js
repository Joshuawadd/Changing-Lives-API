//GLOBAL VARIABLES
var sections = [];
var users = [];
var currentSection = -1;
var currentUser = -1;
var fileLimbo = []; //stores files 'added' but not yet sent to server

//HELPER FUNCTIONS

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

//LOGIN

async function loginPrompt() {
    try {
        let authToken = getCookie('authToken');
        let response = await fetch('/api/users/login/silent?token='+authToken);
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
        let response = await fetch('/api/users/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'userName=' + uname + '&userPassword=' + pass
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

//load the bootstrap login box when the site loads
$(window).on('load',function(){
    loginPrompt();
});

//LISTENERS

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login_form').addEventListener('submit', logIn );
    document.getElementById('edit_user').addEventListener('submit', function(event) {
        if (currentUser >= 0) {
            updateUser(event);
        } else if (currentUser == -1) {
            addUser(event);
        }
    });
    document.getElementById('users').addEventListener('click', userClick );
    document.getElementById('file_adder').addEventListener('change', function() {
        let txt = ' file chosen';
        if (this.files.length != 1) {
            txt = ' files chosen';
        }
        document.getElementById('file_adder_label').innerText = this.files.length + txt;
    });
});