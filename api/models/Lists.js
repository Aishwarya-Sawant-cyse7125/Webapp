const Sequelize = require('sequelize')
const db = require('../../config/database')

const Lists = db.define('lists', {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    userId: {
        type: Sequelize.UUID,
        references: {
            model: "users",
            key: "id"
        }
    },
    listname: {
        type: Sequelize.STRING,
        unique: true
    },
    list_created: {
        type: Sequelize.DATE
    },
    list_updated: {
        type: Sequelize.DATE
    }
    }, {
    schema: 'todo',
    createdAt: 'list_created',
    updatedAt: 'list_updated',
})

module.exports = Lists