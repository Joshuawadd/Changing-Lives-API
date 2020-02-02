const jwt = require('jsonwebtoken');

function checkUser(token) { //this will accept user or staff tokens
    return jwt.verify(token, process.env.USER_KEY, (err, decoded) => {
        if (err) {
            return checkStaff(token); //user check failed, so check for staff token
        } else {
            return decoded.userId; //user token valid
        }
    })
}

function checkStaff (token) {
    return jwt.verify(token, process.env.STAFF_KEY, (err, decoded) => {
        if (err) {
            return undefined; //staff check failed
        } else {
            return decoded.userId; //staff token valid
        }
    })
}

function tokenVerify(token, isAdmin = false) {
    if (!isAdmin) { 
        return checkUser(token);
    } else {
        return checkStaff(token);
    }
}

module.exports = {tokenVerify};