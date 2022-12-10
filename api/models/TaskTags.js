
const Sequelize = require('sequelize')
const db = require('../../config/database')

const TaskTags = db.define('task_tags', {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    taskId: {
        type: Sequelize.UUID,
    },
    tagId: {
        type: Sequelize.UUID,
    }
})
module.exports = TaskTags