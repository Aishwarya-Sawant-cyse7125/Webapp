// import User model from './User.js';
const User          = require('./User')
const Lists         = require('./Lists')
const Tasks         = require('./Tasks')
const Attachments   = require('./Attachments')
const Comments      = require('./Comments')
const Reminders     = require('./Reminders')
const Tags          = require('./Tags')
const TaskTags      = require('./TaskTags')
/**
 * export user model
 */

 //object
module.exports = {
    User,
    Lists,
    Tasks,
    Attachments,
    Comments,
    Reminders,
    Tags,
    TaskTags
}

//export const [User,Attachments]
