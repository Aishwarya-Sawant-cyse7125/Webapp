const Sequelize = require('sequelize')

// connect to postgres server
const db = new Sequelize(`${process.env.DB_NAME}`, `${process.env.DB_USER_NAME}`, `${process.env.DB_PASSWORD}`, {
    host:   `${process.env.DB_ADDRESS}`,
    port: 5432,
    dialect: 'postgres',
    operatorsAlias: false,
    schema : 'todo',
    logging: console.log,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
})

module.exports = db;

// const db = new Sequelize('postgres', 'postgres', 'rolwyn12345', {
//     host:  'localhost' || '127.0.0.1',
//     dialect: 'postgres',
//     operatorsAlias: false,
//     schema : 'todo',
//     pool: {
//         max: 10,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     },
// })

// module.exports = db;
