const Sequelize = require('sequelize')
const db = require('../../config/database')

const Comments = db.define('comments', {
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
    comment: {
        type: Sequelize.STRING,
    },
    comment_created: {
        type: Sequelize.DATE
    },
    comment_modified: {
        type: Sequelize.DATE
    }
    }, {
        schema: 'todo',
        createdAt: 'comment_created',
        updatedAt: 'comment_modified',
    }
)
module.exports = Comments