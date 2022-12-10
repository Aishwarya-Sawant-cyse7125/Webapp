const Task = require('../models/Tasks')
const Comment = require('../models/Comments')
const logger = require('simple-node-logger').createSimpleLogger();
// const { getTodoById } = require('./todoService')
// const { getTaskById } = require('./taskService')

/**
 * 
 * @param {comments} comment object
 * @returns a new comment
 */
 const addcomment = async (comment) => {

    // const task = {
    //     id: "6e336344-de62-494c-afaf-360b337c760e"
    // }

    // const listTask = await getTaskById(comment.taskId)

    // if (!listTask) {
    //     logger.info("----------Task does not exist----------")
    //     return "No task"
    // } else {
    //     const list = await getTodoById(listTask.listid)
    //     if (!list) {
    //         logger.info("----------List does not exist----------")
    //         return "No list"
    //     }
    // }
    return Comment.create(comment)
}

const getcommentbyId = commentid => {
    return Comment.findOne({ where: {id: commentid} })
}

const deletecomment = (item) => {
    //delete a single comment if commentid
    if (item.commentid) {
        return Comment.destroy({ where: { id: item.commentid } })
    }
    else if (item.taskid) { //destroy all tasks in a list if taskid
        return Comment.destroy({ where: { taskId: item.taskid } })
    }
}

const getallcomments = taskid => {
    return Comment.findAll({ where: {taskId: taskid} })
}

module.exports = { addcomment, deletecomment, getcommentbyId, getallcomments }