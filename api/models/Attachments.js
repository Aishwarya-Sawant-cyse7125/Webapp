const Sequelize = require('sequelize')
const db = require('../../config/database')

const Attachments = db.define('attachments', {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: Sequelize.STRING,
        unique: true
    },
    size: {
        type: Sequelize.INTEGER,
    },
    attachedDate: {
        type: Sequelize.DATE
    },
    path: {
        type: Sequelize.STRING,
    },
    taskId: {
        type: Sequelize.UUID,
        references: {
            model: "tasks",
            key: "id"
        }
    }
})

module.exports = Attachments