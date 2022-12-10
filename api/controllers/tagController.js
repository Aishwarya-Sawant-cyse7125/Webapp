const { response } = require('express')
const { addtag, addtasktag, getAllUserTags, modifyTag, getTagByNameAndId, getAllTaskTags, getTagDetailsById, deleteTaskTagByIds } = require('../services/tagService')
const { getTaskById } = require('../services/taskService')
const { getTodoByListAndUserId } = require('../services/todoService')
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

const addTag = async (req, res) => {
    try {
        logger.info("POST: /v1/user/self/tag")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        // give bad request if the following fields are found
        if (req.body.tags_created || req.body.tags_modified || req.body.id)
            return setErrorResponse(`Fields tags_created, tags_modified, and id are not accepted`, res, 400)

        const user = req.user
        const task = await getTaskById(req.body.taskid)
        if (!task)
            return setErrorResponse(`Task does not exist`, res, 400)

        if (!(await isValidUserList(user.id, task.listid)))
            return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)

        async function createTaskTag(req, res, usertag={"status": "User Tag Already Exists"}) {
            const taskTag = {taskId: req.body.taskid, name: req.body.tagname, userId: user.id}
            await addtasktag(taskTag).then((result) => {
                if (result === false) {
                    setErrorResponse(`Task tag already exists, Cannot create!`, res, 400)
                }
                else if (result === "Limit Reached") {
                    setErrorResponse(`Tag limit of 10 reached`, res, 400)
                }
                else {
                    const tasktag = result
                    setSuccessResponse({tasktag, usertag}, res, 201)
                }
            }).catch(err => {
                setErrorResponse(`Error adding task`, res)
            });
        }

        const utag = {name: req.body.tagname, userId: user.id}
        await addtag(utag).then((result) => {
            if (result === false) {
                createTaskTag(req, res)
            }
            else {
                createTaskTag(req, res, result)
            }
        }).catch(err => {
            setErrorResponse(`Error adding task`, res)
        });
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}


const getTaskTags = async (req, res) => {
    try {
        logger.info("GET: /v1/user/self/getTaskTags")
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
        
        // find the tag id and get the tag details from user tag (eg. name etc)
        await getAllTaskTags(req.body.taskid).then(async tasktag => {
            let allTagData = new Array()
            for (let tag in tasktag) {
                let tagid = tasktag[tag].tagId
                const tagDetail = await getTagDetailsById(tagid)
                allTagData.push(tagDetail)
            }
            setSuccessResponse(allTagData, res, 200)
        }).catch(err => {
            setErrorResponse(err.message, res)
        });
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

const getUserTags = async (req, res) => {
    try {
        logger.info("GET: /v1/user/self/getUserTags")
        const user = req.user
        // find the tag id and get the tag details from user tag (eg. name etc)
        await getAllUserTags(user.id).then(result => {
            setSuccessResponse(result, res, 200)
        }).catch(err => {
            setErrorResponse(err.message, res)
        });
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

const updateTag = async (req, res) => {
    try {
        // express validator to check if errors
        logger.info("PUT: /v1/user/self/tag")
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        const user = req.user
        // check if old tag exists
        const currentTag = await getTagByNameAndId(user.id, req.body.tagname)
        if (!currentTag)
        return setErrorResponse(`Tag does not exist or does not belong to user`, res, 400)
        
        // pass tagname and newtagname in body
        await modifyTag(user.id, req.body).then((data) => {
            if (data == 1) {
                setSuccessResponse('', res, 204)
            } else {
                setErrorResponse(`The tag is already present`, res, 400)
            }
        }).catch(err => {
            setErrorResponse(`Error updating tag`, res)
        });
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

const deleteTaskTag = async (req, res) => { 
    try {
        logger.info("DELETE: /v1/user/self/deleteTaskTag")
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

        const userTag = await getTagByNameAndId(user.id, req.body.tagname)
        if (!userTag) {
            setErrorResponse(`The user tag does not exist or does not belong to user`, res, 400)
        }
        else {
            await deleteTaskTagByIds(req.body.taskid, userTag.id)
            setSuccessResponse('', res, 204)
        }
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

module.exports = { addTag, updateTag, getTaskTags, deleteTaskTag, getUserTags }