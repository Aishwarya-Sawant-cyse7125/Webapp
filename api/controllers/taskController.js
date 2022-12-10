const { response } = require('express')
const { checkExistingUser } = require('../services/authService')
const { createtodo, getTodosByUsername, getTodoByListAndUserId, getTodoById, deleteTodoById, modifyTodoList } = require('../services/todoService')
const { createTask, modifyTask, getTaskById, getAllTasks, deleteTodoTaskById, moveTask, deleteTags } = require('../services/taskService')
const { deletecomment } = require('../services/commentService')
const { deletereminder } = require('../services/reminderService')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const multer = require('multer');
const moment = require('moment')
const { Client } = require('@elastic/elasticsearch')
const fs = require("fs");
const Kafka = require('node-rdkafka');
const logger =require('../../api/logger')

const producer = Kafka.Producer.createWriteStream({
    'metadata.broker.list': `${process.env.KAFKA_BROKER}`
}, {}, { topic: `${process.env.TOPIC_NAME}` })

const queueMessage = (data) => {
    const event = { index: 'task', ...data }
    // console.log(Buffer.from(JSON.stringify(event)))
    const result = producer.write(Buffer.from(JSON.stringify(event)))
    if (result)
        logger.info(`The message with index "${event.index}" is published on the Kafka topic`)
    else
        logger.info('Too many messages in our queue already');    
}


const client = new Client({
    node: `${process.env.ELASTIC_URL}`,
    // auth: {
    //     username: `${process.env.ELASTIC_USERNAME}` || 'elastic',
    //     password: `${process.env.ELASTIC_PASSWORD}`
    // },
    // tls: {
    //     ca: fs.readFileSync('tls.crt'),
    //     rejectUnauthorized: false
    // },
    maxRetries: 5,
    requestTimeout: 60000
})

client.info().then(console.log, console.log)

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
        res.json({ error: message })
    res.json({ error: message });
    // res.json();
}

const isValidUserList = async (userid, listid) => {
    const list = await getTodoByListAndUserId(userid, listid)
    if (!list) {
        return false
    }
    return true
}

function convertDate(todaysDate) {
    let tDate = new Date(todaysDate),
        tmonth = '' + (tDate.getMonth() + 1),
        tday = '' + tDate.getDate(),
        tyear = tDate.getFullYear()

    if (tmonth.length < 2) 
        tmonth = '0' + tmonth
    if (tday.length < 2)
        tday = '0' + tday

    return [tyear, tmonth, tday].join('-')
}

const createTodoTask = async (req, res) => {
    try {
        logger.info("POST: /self/task")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            logger.error("Input Validation Error")
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        // give bad request if the following fields are found
        if (req.body.task_created || req.body.task_modified || req.body.id || req.body.state)
            return setErrorResponse(`Fields State, id, task_created, and task_modified are not accepted`, res, 400)

        const user = req.user
        if (!(await isValidUserList(user.id, req.body.listid))) {
            logger.error("The todo list does not exist or task does not belong to user")
            return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
        }

        if (req.body.summary.length > 50) {
            logger.error("Summary should not exceed 50 characters")
            return setErrorResponse(`Summary should not exceed 50 characters`, res, 400)
        }

        const ddate = new Date(req.body.dueDate)
        const tDate = new Date()
        // const newDate = new Date (`${req.body.dueDate} 00:00:00:000`)
    
        if (tDate.getTime() > ddate.getTime()) {
            req.body.state = "OVERDUE"
        }
        else if (tDate.getTime() <= ddate.getTime()) {
            req.body.state = "TODO"
        }

        const task = {...req.body, dueDate: ddate}
        
        const newTask = await createTask(user, task)
        await client.index({
            index: 'task',
            document: {
                taskid: newTask.id,
                listid: newTask.listid,
                summary: newTask.summary,
                task: newTask.task,
                dueDate: newTask.dueDate,
                priority: newTask.priority,
                state: newTask.state,
                task_created: newTask.task_created,
                task_modified: newTask.task_modified
            }
        })
        // await client.index({
        //     index: 'summary',
        //     document: {
        //         taskid: newTask.id,
        //         listid: newTask.listid,
        //         summary: newTask.summary,
        //     }
        // })
        await client.indices.refresh({ index: 'task' })
        console.log(await client.indices.refresh({ index: 'task' }))
        // await client.indices.refresh({ index: 'summary' })
        logger.info("Index is created")
        logger.info("Task is created")
        setSuccessResponse(newTask, res, 201)
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
}

const getTodoTask = async (req, res) => {
    try {
        logger.info("GET: /self/task")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }

        const user = req.user
        const task = await getTaskById(req.body.taskid)
        
        if (!task) {
            logger.error("Task does not exist")
            return setErrorResponse(`Task does not exist`, res, 400)
        }

        if (!(await isValidUserList(user.id, task.listid))) {
            logger.error("The todo list does not exist or task does not belong to user")
            return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
        }

        logger.info("Succesfully fetched task")
        setSuccessResponse(task, res)
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
}

const getAllTodoTasks = async (req, res) => {
    try {
        logger.info("GET - all todo tasks: /v1/user/self/getAllTasks")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            logger.error("Input Validation Error")
            return setErrorResponse(validationErrors.array(), res, 400)
        }

        const user = req.user
        const listid = req.body.listid

        if (!(await isValidUserList(user.id, listid))) {
            logger.error("The todo list does not exist or check list ID")
            return setErrorResponse(`The todo list does not exist or check list ID`, res, 400)
        }

        const allTasks = await getAllTasks(listid)
        setSuccessResponse(allTasks, res)
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(`Error while finding tasks`, res) 
    }
}

const moveTodoTask = async (req, res) => {
    try {
        logger.info("PUT: /v1/user/self/moveTask")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        const user = req.user
        const newListId = req.body.newListId
        const task = await getTaskById(req.body.taskid)
        
        if (!task) {
            logger.error("Task does not exist")
            return setErrorResponse(`Task does not exist`, res, 400)
        }

        if (!(await isValidUserList(user.id, newListId))) {
            logger.error("The list to be transferred to doesn't exist")
            return setErrorResponse(`The list to be transferred to doesn't exist`, res, 400)
        }

        const movedTask = await moveTask(newListId, task.id)
        setSuccessResponse('', res, 204)
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
}

const updateTodoTask = async (req, res) => {
    logger.info("PUT: /self/task")
    const user = req.user
    const task = await getTaskById(req.body.taskid)

    if (!task) {
        logger.error("Task does not exist")
        return setErrorResponse(`Task does not exist`, res, 400)
    }

    if (!(await isValidUserList(user.id, task.listid))) {
        logger.error("The todo list does not exist or task does not belong to user")
        return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
    }

    const ddate = new Date(req.body.dueDate)
    const tDate = new Date()
    req.body.dueDate = ddate
    // const tDate = new Date(convertDate(new Date))

    if (tDate.getTime() > ddate.getTime() && req.body.state !== "COMPLETE") {
        req.body.state = "OVERDUE"
    }

    if (tDate.getTime() < ddate.getTime() && req.body.state !== "COMPLETE") {
        req.body.state = "TODO"
    }

    await modifyTask(req.body).then(async(data) => {
        if (data == 1) {

            let result = await client.search({
                index: 'task',
                query: {
                    match: { taskid: req.body.taskid }
                }
            })

            const queueData = { id: result.hits.hits[0]._id, ...req.body}

            queueMessage(queueData)

            setSuccessResponse('', res, 204)
        } else {
            logger.error("Task not found")
            setErrorResponse(`Task not found`, res, 400)
        }
    }).catch(err => {
        logger.error("Error updating task")
        setErrorResponse(`Error updating task`, res)
    });
}

const deleteTodoTask = async (req, res) => { 
    try {
        logger.info("DELETE: /self/task")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }

        const user = req.user
        const task = await getTaskById(req.body.taskid)
        if (!task) {
            logger.error("Task does not exist")
            return setErrorResponse(`Task does not exist`, res, 400)
        }

        if (!(await isValidUserList(user.id, task.listid))) {
            logger.error("The todo list does not exist or task does not belong to user")
            return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
        }

        await deleteTags(task.id)
        await deletecomment(req.body)
        await deletereminder(req.body)
        await deleteTodoTaskById(req.body)
        setSuccessResponse('', res, 204)
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
}

const getSearchData = async (req, res) => {
    try {
        logger.info("GET: /v1/user/self/search?keywords=")
        // express validator to check if errors
        // await client.indices.refresh({ index: 'task' })
        const keywords = req.query.keywords.split(',')
        console.log(keywords)
        const resultData = []
        let searchData = new Promise((resolve, reject) => {
            keywords.forEach(async (item, index, array) => {
                let result = await client.search({
                    index: 'task',
                    query: {
                        multi_match: {
                            query: item,
                            fields: ['task', 'summary']
                        }
                    }
                })
                resultData.push(result)
                if (index === array.length - 1) resolve()
            })
        })
        
        searchData.then(() => {
            logger.info("Search is successful")
            // console.log(resultData)
            setSuccessResponse(resultData, res, 200)
        });
    } catch (e) {
        logger.error(`${e.message}`)
        setErrorResponse(e.message, res)
    }
}

module.exports = { createTodoTask, updateTodoTask, deleteTodoTask, getTodoTask, getAllTodoTasks, moveTodoTask, getSearchData }