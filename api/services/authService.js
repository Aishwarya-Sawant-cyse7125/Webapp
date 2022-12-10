const User = require('../models/User')
const Prom = require('prom-client');

const counter = new Prom.Counter({
    name: "time_database_calls",
    help: "Database calls"
});

/**
 * save function returns a promise when data is saved
 * create a user and insert it in db
 * 
 * @param {user} the user 
 * @returns the save promise 
 */

/**
 * 
 * @param {user} user body from request 
 * @returns a new user
 */
const signupuser = (user) => {
    counter.inc()
    return User.create(user)
}

/**
 * 
 * @param {username} username of the user
 * @returns the user
 */
const checkExistingUser = (emailid) => {
    counter.inc()
    return User.findOne({ where: { emailid: emailid } })
}

/**
 * 
 * @param {existingUser} existing user from db
 * @returns updated user information
 */
const modifyUser = (existingUser) => {
    counter.inc()
    return existingUser.save()
}

module.exports = {signupuser, checkExistingUser, modifyUser}