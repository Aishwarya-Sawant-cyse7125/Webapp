const Sequelize = require('sequelize')
const db = require('../../config/database')

const Tags = db.define('tags', {
    //references
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
    name: {
        type: Sequelize.STRING,
        unique: true
    },
    tags_created: {
        type: Sequelize.DATE
    },
    tags_modified: {
        type: Sequelize.DATE
    }
    }, {
    schema: 'todo',
    createdAt: 'tags_created',
    updatedAt: 'tags_modified',
})

module.exports = Tags