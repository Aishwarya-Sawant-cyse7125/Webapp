const { response } = require('express')
const { validationResult } = require('express-validator')
const { addreminder, deletereminder, getallreminders, getreminderbyId } = require('../services/reminderService')
const { getTodoByListAndUserId } = require('../services/todoService')
const { getTaskById } = require('../services/taskService')
const bcrypt = require('bcryptjs')
const logger = require('../../api/logger')

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

const isValidUserList = async (userid, listid) => {
    const list = await getTodoByListAndUserId(userid, listid)
    if (!list) {
        return false
    }
    return true
}

const addReminder = async (req, res) => {
    try {
        logger.info("POST: /v1/user/self/reminder")
        const user = req.user
        const task = await getTaskById(req.body.taskid)
        if (!task)
            return setErrorResponse(`Task does not exist`, res, 400)
    
        if (!(await isValidUserList(user.id, task.listid)))
            return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
    
        const reminder = {taskId: req.body.taskid, reminderdate: req.body.reminderdate}
        await addreminder(reminder).then((result) => {
            // console.log(result)
            if (result === "Limit Exceeded") {
                setErrorResponse(`Cannot add more than 5 reminders`, res, 400)
            }
            // else if (result === "No list") {
            //     setErrorResponse(`List does not exist`, res, 400)
            // }
            // else if (!result || result == '') {
            //     setErrorResponse(`No data`, res, 400)
            // }
            else {
                setSuccessResponse(result, res, 201)
            }
        }).catch(err => {
            setErrorResponse(`Error adding reminder`, res, 400)
        });
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

const getAllReminders = async (req, res) => {
    try {
        logger.info("GET: /v1/user/self/getAllReminders")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        const user = req.user
        const task = await getTaskById(req.body.taskid)
        if (!task)
            return setErrorResponse(`Task does not exist`, res, 400)
    
        if (!(await isValidUserList(user.id, task.listid)))
            return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)

        const allReminders = await getallreminders(req.body.taskid)
        setSuccessResponse(allReminders, res)
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

const deleteReminder = async (req, res) => { 
    try {
        logger.info("DELETE: /v1/user/self/reminder")
        const user = req.user
        if (req.body.reminderid || req.body.taskid) {

            let reminderData = '';
            if (req.body.reminderid) {
                reminderData = await getreminderbyId(req.body.reminderid)
            }

            if (reminderData || req.body.taskid) {
                const task = await getTaskById(reminderData.taskId || req.body.taskid)
                if (!task)
                    return setErrorResponse(`Task does not exist`, res, 400)
                
                if (!(await isValidUserList(user.id, task.listid)))
                    return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
            }
        } else {
            return setErrorResponse(`Enter either reminderid or taskid`, res, 400)
        }
        await deletereminder(req.body)
        setSuccessResponse('', res, 204)
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

module.exports = { addReminder, deleteReminder, getAllReminders }