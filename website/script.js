//load the bootstrap login box when the site loads
$(window).on('load',function(){
    $('#login_box').modal('show');
});

function logIn(event) {
    event.preventDefault();
    $('#login_box').modal('hide');
}

document.addEventListener('DOMContentLoaded', function() { //set up listeners
    document.getElementById('login_form').addEventListener('submit', logIn );
});