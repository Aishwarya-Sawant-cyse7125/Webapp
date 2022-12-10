const Task = require('../models/Tasks')
const TaskTag = require('../models/TaskTags')
const logger = require('simple-node-logger').createSimpleLogger();
const { getTodosByUsername } = require('./todoService')

/**
 * 
 * @param {tasks} task object
 * @returns a new task
 */
const createTask = async (user, task) => {

    // const task = {
    //     id: "6e336344-de62-494c-afaf-360b337c760e"
    // }

    const allTodoLists = await getTodosByUsername(user.id)

    
    if (!allTodoLists) {
        logger.info("----------No List Found----------")
        return false
    }
    
    let isValidListId = false;
    allTodoLists.forEach(function (list) {
        console.log(list.id)
        if (list.id === task.listid) {
            isValidListId = true
        }
    });
    if (!isValidListId) {
        logger.info("----------List id is not present----------")
        return false
    }

    return Task.create(task)
    // console.log(isValidListId)
}

const getTaskById = (taskid) => {
    return Task.findOne({ where: {id: taskid} })
}

const getAllTasks = (listid) => {
    return Task.findAll({ where: {listid: listid} })
}

const modifyTask = async (task) => {
    console.log("inside modified task")
    
    const updateTask = await Task.update(
        {   
            summary: task.summary,
            task: task.task,
            dueDate: task.dueDate,
            priority: task.priority,
            state: task.state
        },
        {where: { id: task.taskid }}
    )
    return updateTask;
}

const moveTask = async (newlistid, taskid) => {    
    return await Task.update({ listid: newlistid }, {where: { id: taskid }})
}

const deleteTodoTaskById = (item) => {
    //delete a single task if taskid
    if (item.taskid) {
        return Task.destroy({ where: { id: item.taskid } })
    }
    else if (item.listid) { //destroy all tasks in a list if listid
        return Task.destroy({ where: { listid: item.listid } })
    }
}

const deleteTags = (taskid) => {
    return TaskTag.destroy({ where: { taskId: taskid } })
}

module.exports = { createTask, modifyTask, getTaskById, getAllTasks, deleteTodoTaskById, moveTask, deleteTags }