const Task = require('../models/Tasks')
const Reminder = require('../models/Reminders')
const logger = require('simple-node-logger').createSimpleLogger();
const { getTodoById } = require('./todoService')
const { getTaskById } = require('./taskService')

/**
 * 
 * @param {reminder} reminder object
 * @returns a new reminder
 */
const addreminder = async (reminder) => {
    // const listTask = await getTaskById(reminder.taskId)

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
    const allReminders = await getallreminders(reminder.taskId)

    if (allReminders.length >= 5) {
        return "Limit Exceeded"
    } else {
        let createReminder = Reminder.create(reminder);
        return createReminder;
    }

}

const getreminderbyId = reminderid => {
    return Reminder.findOne({ where: {id: reminderid} })
}

const deletereminder = (item) => {
    //delete a single reminder if taskid
    if (item.reminderid) {
        return Reminder.destroy({ where: { id: item.reminderid } })
    }
    else if (item.taskid) { //destroy all reminders in a list if listid
        return Reminder.destroy({ where: { taskId: item.taskid } })
    }
}

const getallreminders = taskid => {
    return Reminder.findAll({ where: {taskId: taskid} })
}

module.exports = { addreminder, deletereminder, getallreminders, getreminderbyId }