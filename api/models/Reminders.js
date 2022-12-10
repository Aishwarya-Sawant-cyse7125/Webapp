const Sequelize = require('sequelize')
const db = require('../../config/database')

const Reminders = db.define('reminders', {
    //references
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    taskId: {
        type: Sequelize.UUID,
        references: {
            model: "tasks",
            key: "id"
        }
    },
    reminderdate: {
        type: Sequelize.DATE
    },
    reminder_created: {
        type: Sequelize.DATE
    },
    reminder_modified: {
        type: Sequelize.DATE
    }
    }, {
        schema: 'todo',
        createdAt: 'reminder_created',
        updatedAt: 'reminder_modified',
    }
)
module.exports = Reminders