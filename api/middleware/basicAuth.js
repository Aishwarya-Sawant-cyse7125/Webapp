const bauth = require('basic-auth')
const { checkExistingUser } = require('../services/authService')
const bcrypt = require('bcryptjs')

/**
 * Set a error response
 * 
 * @param {*} message the message if there is an error (returned from catch block)
 * @param {*} res will return 500 response status code if there is an error
 */
const setErrorResponse = (message, res, errCode=500) => {
    res.status(errCode);
    if (errCode == 500)
        res.json();
    res.json({ error: message });
}

const basicAuth = async (req, res, next) => {

    const userCredentials = bauth(req)

    if (!userCredentials) {
        return res.status(403).setHeader('WWW-Authenticate', 'Basic realm="Access to User Data"').send()
    }
    else {
        // the username and password from Basic Auth
        const requsername = userCredentials.name
        const reqpassword = userCredentials.pass
    
        // pass header username(email) to check if user exists
        let existingUser = await checkExistingUser(requsername.toLowerCase())
        if (existingUser == null) return setErrorResponse(`User not found`, res, 401)
    
        let isPasswordMatch = bcrypt.compareSync(
            reqpassword,
            existingUser.password
        );
    
        // if wrong password throw 401
        if (!isPasswordMatch) return setErrorResponse(`Credentials do not match`, res, 401)
    
        req.credentials = userCredentials
        req.user = existingUser
    
        next()

    }
}

module.exports = basicAuth