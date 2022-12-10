// import express from 'express'
// import * as authController from '../../controllers/authController.js'
// // import verifySignUpDetails from '../../middlewares/verifySignUpDetails.js'
// import User from '../../models/User.js'

const express = require('express')
const controller = require('../controllers/authController.js')
const todoController = require('../controllers/todoController.js')
const taskController = require('../controllers/taskController.js')
const tagController = require('../controllers/tagController.js')
const commentController = require('../controllers/commentController.js')
const reminderController = require('../controllers/reminderController.js')
const User = require('../models/User')
const basicAuth = require('../middleware/basicAuth')

const { body } = require('express-validator');
const app = require('../app');

const router = express.Router();
const multer = require('multer');
const upload = multer();
/**
 * auth urls
 * get      - get data
 * post     - add data
 * put      - update the existing data
 * delete   - delete data from db
 */

// open route for adding a user
router.route('/')
   .post(
      body('emailid').isEmail(),
      body('firstname').trim().not().isEmpty(),
      body('lastname').trim().not().isEmpty(),
      body("password").isStrongPassword({
         minLength: 8,
         minNumbers: 1,
         minUppercase: 1
      })
      .withMessage("Password length should be greater than 8 with 1 uppercase and minimum 1 numeric"),
      controller.signup
   )

// user routes only for authenticated users
router.route('/self')
   .get(
      basicAuth,
      controller.authenticate
   )
   .put(
      basicAuth,
      body('firstname').trim().not().isEmpty(),
      body('lastname').trim().not().isEmpty(),
      body('middlename').trim().not().isEmpty(),
      body("password").isStrongPassword({
         minLength: 8,
         minNumbers: 1,
         minUppercase: 1
      })
      .withMessage("Password length should be greater than 8 with 1 uppercase and minimum 1 numeric"),
      controller.updateUser
   )

router.route('/self/list')
   .get(
      basicAuth,
      body('listid').trim().not().isEmpty().withMessage("listid should not be empty"),
      todoController.getTodo
   )
   .post(
      basicAuth,
      body('listname').trim().not().isEmpty().withMessage("listname should not be empty"),
      todoController.createTodo
   )
   .delete(
      basicAuth,
      body('listid').trim().not().isEmpty().withMessage("listid should not be empty"),
      todoController.deleteTodo
   )
   .put(
      basicAuth,
      body('listid').trim().not().isEmpty().withMessage("listid should not be empty"),
      body('listname').trim().not().isEmpty().withMessage("listname should not be empty"),
      todoController.updateTodo
   )

router.route('/self/getAllTodoLists')
   .get(
      basicAuth,
      todoController.getAllTodos
   )

router.route('/self/getAllTasks')
.get(
   basicAuth,
   body('listid').trim().not().isEmpty().withMessage("listid should not be empty"),
   taskController.getAllTodoTasks
)

router.route('/self/moveTask')
.put(
   basicAuth,
   body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
   body('newListId').trim().not().isEmpty().withMessage("newListId should not be empty"),
   taskController.moveTodoTask
)

router.route('/self/task')
   .get(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      taskController.getTodoTask
   )
   .post(
      basicAuth,
      body('listid').trim().not().isEmpty().withMessage("listid should not be empty"),
      body('summary').trim().not().isEmpty().withMessage("summary should not be empty"),
      body('task').trim().not().isEmpty().withMessage("task should not be empty"),
      body('dueDate').trim().not().isEmpty().withMessage("dueDate should not be empty"),
      body('priority').trim().not().isEmpty().withMessage("priority should not be empty"),
      taskController.createTodoTask
   )
   .put(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      body('summary').trim().not().isEmpty().withMessage("summary should not be empty"),
      body('task').trim().not().isEmpty().withMessage("task should not be empty"),
      body('dueDate').trim().not().isEmpty().withMessage("dueDate should not be empty"),
      body('priority').trim().not().isEmpty().withMessage("priority should not be empty"),
      body('state').trim().not().isEmpty().withMessage("state should not be empty"),
      taskController.updateTodoTask
   )
   .delete(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      taskController.deleteTodoTask
   )

router.route('/self/getUserTags')
   .get(
      basicAuth,
      tagController.getUserTags
   )

router.route('/self/getTaskTags')
   .get(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      tagController.getTaskTags
   )

router.route('/self/deleteTaskTag')
   .delete(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      body('tagname').trim().not().isEmpty().withMessage("tagname should not be empty"),
      tagController.deleteTaskTag
   )

router.route('/self/tag')
   .post(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      body('tagname').trim().not().isEmpty().withMessage("tagname should not be empty"),
      tagController.addTag
   )
   .put(
      basicAuth,
      body('tagname').trim().not().isEmpty().withMessage("tagname should not be empty"),
      body('newtagname').trim().not().isEmpty().withMessage("newtagname should not be empty"),
      tagController.updateTag
   )

router.route('/self/getAllComments')
   .get(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      commentController.getAllComments
   )

router.route('/self/comment')
   .post(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      body('comment').trim().not().isEmpty().withMessage("comment should not be empty"),
      commentController.addComment
   )
   .delete(
      basicAuth,
      commentController.deleteComment
   )

router.route('/self/getAllReminders')
   .get(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      reminderController.getAllReminders
   )

router.route('/self/reminder')
   .post(
      basicAuth,
      body('taskid').trim().not().isEmpty().withMessage("taskid should not be empty"),
      body('reminderdate').trim().not().isEmpty().withMessage("reminderdate should not be empty"),
      reminderController.addReminder
   )
   .delete(
      basicAuth,
      reminderController.deleteReminder
   )

router.route('/self/search')
   .get(
      basicAuth,
      taskController.getSearchData
   )

// export default router
module.exports = router