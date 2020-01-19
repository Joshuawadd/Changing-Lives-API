//load the bootstrap login box when the site loads
$(window).on('load',function(){
    $('#login_box').modal('show');
});

function logIn(event) { //the login function currently only hides the login box
    event.preventDefault();
    $('#login_box').modal('hide');
}

function userClick(event) {
    event.preventDefault();
    document.getElementById('main_content').innerHTML = '<p>The users area is loaded</p>';
    //the code for loading the user modification area goes here
}

function contentClick(event) {
    event.preventDefault();
    document.getElementById('main_content').innerHTML = '<p>The content area is loaded</p>';
    //the code for loading the content modification area goes here
}

document.addEventListener('DOMContentLoaded', function() { //set up listeners
    document.getElementById('login_form').addEventListener('submit', logIn );
    document.getElementById('users').addEventListener('click', userClick );
    document.getElementById('content').addEventListener('click', contentClick );
});