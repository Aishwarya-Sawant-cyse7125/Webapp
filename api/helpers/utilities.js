const { checkExistingUser } = require('../services/authService')
const bcrypt = require('bcryptjs')

const checkExistingUserUtil = (req, res, setErrorResponse) => {
    // the username and password from Basic Auth
    const requsername = req.credentials.name
    const reqpassword = req.credentials.pass

    // pass header username(email) to check if user exists
    let existingUser = checkExistingUser(requsername.toLowerCase())
    if (existingUser == null) return setErrorResponse(`User not found`, res, 401)

    let isPasswordMatch = bcrypt.compareSync(
        reqpassword,
        existingUser.password
    );

    // if wrong password throw 401
    if (!isPasswordMatch) return setErrorResponse(`Credentials do not match`, res, 401)
}

module.exports = { checkExistingUserUtil }