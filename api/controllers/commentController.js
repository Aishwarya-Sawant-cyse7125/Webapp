const { response } = require('express')
const { validationResult } = require('express-validator')
const { addcomment, deletecomment, getcommentbyId, getallcomments } = require('../services/commentService')
const { getTodoByListAndUserId } = require('../services/todoService')
const { getTaskById } = require('../services/taskService')
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

const addComment = async (req, res) => {
    try {
        logger.info("POST: /v1/user/self/comment")
        // express validator to check if errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return setErrorResponse(validationErrors.array(), res, 400)
        }
        // give bad request if the following fields are found
        if (req.body.comment_created || req.body.comment_modified || req.body.id)
            return setErrorResponse(`Fields comment_created, comment_modified, and id are not accepted`, res, 400)

        const user = req.user
        const task = await getTaskById(req.body.taskid)
        if (!task)
            return setErrorResponse(`Task does not exist`, res, 400)
    
        if (!(await isValidUserList(user.id, task.listid)))
            return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
    
        const comment = {taskId: req.body.taskid, comment: req.body.comment}
    
        await addcomment(comment).then((result) => {
            // if (result === false) {
            //     setErrorResponse(`Check task id, Cannot create!`, res, 400)
            // }
            // else if (result === "No task") {
            //     setErrorResponse(`Task does not exist`, res, 400)
            // }
            // else if (result === "No list") {
            //     setErrorResponse(`List does not exist`, res, 400)
            // }
            // else {
            //     setSuccessResponse(result, res, 201)
            // }
            setSuccessResponse(result, res, 201)
        }).catch(err => {
            setErrorResponse(err.message || `Error adding task`, res)
        });
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

const getAllComments = async (req, res) => {
    try {
        logger.info("GET: /v1/user/self/getAllComments")
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

        const allComments = await getallcomments(req.body.taskid)
        console.log(allComments)
        setSuccessResponse(allComments, res)
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

const deleteComment = async (req, res) => { 
    try {
        logger.info("DELETE: /v1/user/self/comment")
        const user = req.user

        if (req.body.commentid || req.body.taskid) {

            let commentData = '';
            if (req.body.commentid) {
                commentData = await getcommentbyId(req.body.commentid)
            }

            if (commentData || req.body.taskid) {
                const task = await getTaskById(commentData.taskId || req.body.taskid)
                if (!task)
                    return setErrorResponse(`Task does not exist`, res, 400)
                
                if (!(await isValidUserList(user.id, task.listid)))
                    return setErrorResponse(`The todo list does not exist or task does not belong to user`, res, 400)
            }
        } else {
            return setErrorResponse(`Enter either commendid or taskid`, res, 400)
        }
        // give task or comment id to delete all or a single comment
        await deletecomment(req.body)
        setSuccessResponse('', res, 204)
    } catch (e) {
        setErrorResponse(e.message, res, 400)
    }
}

module.exports = { addComment, deleteComment, getAllComments }