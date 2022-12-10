const { response } = require('express')
const { signupuser, checkExistingUser, modifyUser } = require('../services/authService')
const { createtodo } = require('../services/todoService')
const User = require('../models/User')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const Sequelize = require('sequelize')
const logger =require('../../api/logger')

/**
 * Set a success response
 * 
 * @param {*} data take the response of the query and returns as JSON
 * @param {*} res server response if call is successful
 */
const setSuccessResponse = (data, res, successCode=200) => {
    res.status(successCode);
    res.json(data)
}

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

/**
 * 
 * @param {req} req body
 * @param {res} the response to be sent 
 * @returns a success response json or error 
 */
const signup = async (req, res) => {
    try {
        // express validator to check if errors
        // process.stdout.write("/v1/user" + "\n");
        logger.info("POST: /v1/user")
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            logger.error("Input Validation Error")
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        // give bad request if the following fields are found
        if (req.body.account_created || req.body.account_updated || req.body.createdAt|| req.body.updatedAt || req.body.id) {
            logger.error("Invalid data supplied while updating user")
            return setErrorResponse(`Fields id, account_created, account_updated, updatedAt and createdAt are not accepted`, res, 400)
        }

        // check if user exists
        const existingUser = await checkExistingUser(req.body.emailid)
        if (typeof existingUser === 'object' && existingUser !== null) {
            logger.error("User with same email address exists, Add unique email address")
            return setErrorResponse(`User already exists or there is some error`, res, 400)
        }

        const user = {...req.body, password: bcrypt.hashSync(req.body.password, 8)}
        const newUser = await signupuser(user)

        const listName = 'Default todo'
        const defaultList = {listname: listName, userId: newUser.id}
        await createtodo(defaultList)

        // convert to json and return response without password
        const userData = newUser.toJSON()
        let {password, ...newUserData} = {...userData}
        logger.info("User is registered")
        setSuccessResponse(newUserData, res, 201)
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
};

const authenticate = async (req, res) => {
    try {
        // the username and password from Basic Auth
        // const requsername = req.credentials.name
        // const reqpassword = req.credentials.pass

        // // pass header username(email) to check if user exists
        // const existingUser = await checkExistingUser(requsername.toLowerCase())
        // if (existingUser == null) return setErrorResponse(`User not found`, res, 401)

        // let isPasswordMatch = bcrypt.compareSync(
        //     reqpassword,
        //     existingUser.password
        // );

        // // if wrong password throw 401
        // if (!isPasswordMatch) return setErrorResponse(`Credentials do not match`, res, 401)
        logger.info("GET: /v1/user")
        const user = req.user

        const userData = user.toJSON()
        let {password, ...newUserData} = {...userData}
        logger.info("User is authenticated")
        setSuccessResponse(newUserData, res)
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
}

const updateUser = async (req, res) => {
    try {
        logger.info("PUT: /v1/user")
        // if any validation fails
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        
        const user = req.user 

        // if the following field exists in request body throw Bad Request
        if (req.body.account_created || req.body.account_updated || req.body.createdAt|| req.body.updatedAt || req.body.id) {
            logger.error(`Fields_not_allowed: id, account_created, account_updated, updatedAt and createdAt are not accepted`)
            return setErrorResponse(`{ Fields_not_allowed: id, account_created, account_updated, updatedAt and createdAt are not accepted }`, res, 400)
        }

        let changeEmailId = false
        if (req.body.emailid) {
            const emailIdExists = await checkExistingUser(req.body.emailid)
            if (!emailIdExists)
                changeEmailId = true
        }
        // console.log(changeEmailId)

        if (changeEmailId)
            user.emailid = req.body.emailid
        
        // console.log(user.emailid)

        if (req.body.emailid && !changeEmailId) {
            logger.error(`User with same email address exists, Add unique email address`)
            return setErrorResponse(`User with same email address exists, Add unique email address`, res, 400)
        }
        
        // append the details to the authenticated user
        user.firstname = req.body.firstname
        user.lastname = req.body.lastname
        user.middlename = req.body.middlename
        user.password =  bcrypt.hashSync(req.body.password, 8)
        
        // call the modifyUser service
        const updateUser = await modifyUser(user)
        logger.info("User is updated")
        setSuccessResponse('', res, 204)
        
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
}

module.exports = {
    signup, authenticate, updateUser
}