const { response } = require('express')
const { checkExistingUser } = require('../services/authService')
const { createtodo, getTodosByUsername, getTodoById, deleteTodoById, modifyTodoList, getTodoByListAndUserId } = require('../services/todoService')
const { getAllTasks, deleteTodoTaskById, deleteTags } = require('../services/taskService')
const { deletecomment } = require('../services/commentService')
const { deletereminder } = require('../services/reminderService')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
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

const isValidUserList = async (userid, listid) => {
    const list = await getTodoByListAndUserId(userid, listid)
    if (!list) {
        return false
    }
    return true
}

const createTodo = async (req, res) => {
    try {
        logger.info("POST: /v1/user/self/list")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        // give bad request if the following fields are found
        if (req.body.list_created || req.body.list_updated || req.body.userId || req.body.id) 
            return setErrorResponse(`Fields id, list_created, list_updated and userId are not accepted`, res, 400)
        
        const user = req.user 

        const list = {...req.body, userId: user.id}
        const newList = await createtodo(list)
        
        // convert to json and return response
        const listData = newList.toJSON()
        logger.info("Created Todo List")
        setSuccessResponse(listData, res, 201)
    } catch (e) {
        setErrorResponse(e.message, res)
    }
}

const getAllTodos = async (req, res) => {
    try {
        logger.info("GET: /v1/user/self/getAllTodoLists")
        const user = req.user
        const lists = await getTodosByUsername(user.id)
        setSuccessResponse(lists, res)
    } catch (e) {
        setErrorResponse(e.message, res) 
    }
}

const getTodo = async (req, res) => {
    try {
        logger.info("GET: /v1/user/self/list")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            logger.error("Validation error")
            return setErrorResponse(validationErrors.array(), res, 400)
        }

        const user = req.user
        if (!(await isValidUserList(user.id, req.body.listid))) {
            logger.error("The todo list does not exist or does not belong to user")
            return setErrorResponse(`The todo list does not exist or does not belong to user`, res, 400)
        }

        const list = await getTodoById(req.body.listid)
        logger.info("Fetched list")
        setSuccessResponse(list, res)
    } catch (e) {
        setErrorResponse(e.message, res) 
    }
}

const deleteTodo = async (req, res) => {
    try {
        logger.info("DELETE: /v1/user/self/list")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }

        const user = req.user
        if (!(await isValidUserList(user.id, req.body.listid))) {
            logger.error("The todo list does not exist or does not belong to user")
            return setErrorResponse(`The todo list does not exist or does not belong to user`, res, 400)
        }

        const allTasks = await getAllTasks(req.body.listid)

        if (!allTasks) {
            logger.error("There are no tasks to delete")
            return setErrorResponse(`There are no tasks to delete`, res, 400)
        }

        for (let task in allTasks) {
            let taskdetail = { taskid: allTasks[task].id }
            // console.log(allTasks[task])
            await deleteTags(allTasks[task].id)
            await deletecomment(taskdetail)
            await deletereminder(taskdetail)
            await deleteTodoTaskById(taskdetail)
        }

        const deleteList = await deleteTodoById(req.body.listid)
        logger.info("All data inside the task has been cleared")
        setSuccessResponse('', res, 204)
    } catch (e) {
        setErrorResponse(e.message, res) 
    }
}

const updateTodo = async (req, res) => {
    try {
        logger.info("PUT: /v1/user/self/list")
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        const user = req.user
        if (!(await isValidUserList(user.id, req.body.listid))) {
            logger.error("The todo list does not exist or does not belong to user")
            return setErrorResponse(`The todo list does not exist or does not belong to user`, res, 400)
        }
        
        const updateList = await modifyTodoList(req.body.listid, req.body.listname)
        logger.info("Todo list updated")
        setSuccessResponse('', res, 204)
    } catch (e) {
        setErrorResponse(e.message, res)
    }
}

module.exports = { createTodo, getAllTodos, getTodo, deleteTodo, updateTodo }