const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const routes = require('./routes/index')
const cors = require('cors')
const db = require('../config/database')
const { User, Lists, Tasks, Attachments, Comments, Reminders, Tags, TaskTags} = require('./models/index')

/*added with Rolwyn*/
// const {Attachments} = require('./models/index.js')

// creates an express server
const app = express();

// db.createSchema('todo')

// db.sync({ force: false }).then(() => {
//     console.log("Drop and re-sync db.");
// });

// db.sync()

// Test db
db.authenticate()
    .then(() => console.log('Database Connected...'))
    .catch(err => console.log('Error:' +err))

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// set routes
routes(app);

module.exports = app;