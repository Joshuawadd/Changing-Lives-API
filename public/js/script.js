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
        document.getElementById('logged_in').innerHTML = 'Not logged in';
        let authToken = getCookie('authToken');
        let response = await fetch('/api/users/login/silent?token='+authToken);
        if (response.ok) {
            document.getElementById('logged_in').innerHTML = 'Logged in as: ' + getCookie('userName');
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
        document.getElementById('logged_in').innerHTML = 'Not logged in';
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
            let tk = JSON.parse(authToken).token;
            document.getElementById('logged_in').innerHTML = 'Logged in as: ' + uname;
            document.cookie = 'userName=' + uname;
            document.cookie = 'authToken=' + tk;
        }
        else {
            throw new Error(response.status);
        }
    } catch(error) {
        alert('Incorrect Username and/or Password');
    }
}

function logOut(event) {
    event.preventDefault();
    document.cookie = 'authToken=' + '';
    loginPrompt();
}

//load the bootstrap login box when the site loads
$(window).on('load',function(){
    loginPrompt();
});

//LISTENERS

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login_form').addEventListener('submit', logIn );
    document.getElementById('log_out').addEventListener('click', logOut);
});