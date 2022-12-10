
const Sequelize = require('sequelize')
const db = require('../../config/database')

const Tasks = db.define('tasks', {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    listid: {
        type: Sequelize.UUID,
        references: {
            model: "lists",
            key: "id"
        }
    },
    summary: {
        type: Sequelize.STRING,
    },
    task: {
        type: Sequelize.STRING,
    },
    dueDate: {
        type: Sequelize.DATE
    },
    priority: {
        type: Sequelize.STRING
    },
    state: {
        type: Sequelize.STRING,
    },
    task_created: {
        type: Sequelize.DATE
    },
    task_modified: {
        type: Sequelize.DATE
    }
    },{
    schema: 'todo',
    createdAt: 'task_created',
    updatedAt: 'task_modified',
})

module.exports = Tasks
