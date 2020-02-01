const jwt = require('jsonwebtoken');

function tokenVerify(token, isAdmin = false) {
    var val = false;
    if (!isAdmin) { //this will accept user or staff tokens
        jwt.verify(token, process.env.TOKEN_USER, (err) => {
            if (err) {
                isAdmin = true; //now check for staff token
            } else {
                val = true; //user token valid
            }
        });
    }
    if (isAdmin) { //this accepts only staff tokenss
        jwt.verify(token, process.env.TOKEN_STAFF, (err) => {
            if (err) {
                val = false; //neither token is valid
            } else {
                val = true; //staff token valied
            }
        });
    }
    return val;
}

module.exports = {tokenVerify};