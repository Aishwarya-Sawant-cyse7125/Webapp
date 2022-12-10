const authRouter = require('./authRoute')
const db = require('../../config/database')
const Prom = require('prom-client');

/**
 * Set a error response
 * 
 * @param {*} message the message if there is an error (returned from catch block)
 * @param {*} res will return 500 response status code if there is an error
 */
const setErrorResponse = (message, res, errCode=500) => {
    res.status(errCode);
    if (errCode == 500)
        res.json({ error: message })
    res.json({ error: message });
    // res.json();
}

// const requestDuration = new client.Histogram({
//     name: 'http_request_duration_seconds',
//     help: 'request duration histogram',
//     labelNames: ['handler' , 'method', 'statuscode'],
//     //buckets: [0.5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
//     buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
// });
// register.registerMetric(requestDuration)

const collectDefaultMetrics = Prom.collectDefaultMetrics
collectDefaultMetrics({
    timeout: 5000
})

const httpRequestDurationMs = new Prom.Histogram({
    name: 'http_request_duration_ms',
    help: 'request duration histogram in ms',
    labelNames: ['route', 'method', 'statuscode'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
})

const promcounter = new Prom.Counter({
    name: 'node_request_operations_total',
    help: 'number of processed request',
})

/**
 * performs a Http get request
 * @param {app} the express app 
 */
module.exports = function(app) {
    app.get('/healthz', (req, res) => {
        console.log("Application is alive")
        promcounter.inc();
        httpRequestDurationMs.labels(req.route.path, req.method, res.statusCode).observe(5);
        res.json()
        // // res.sendStatus(200);
    });
    app.get('/dbtest', (req, res) => {
        db.authenticate()
        .then(() => {
            console.log("DB Still Connected: Readiness verified")
            res.json("DB Connection Successful")
        })
        .catch(err => {
            console.log('Error:' +err);
            setErrorResponse(`DB Connection Unsuccessful`, res, 400)
        })
        // // res.sendStatus(200);
    });
    app.get('/metrics', async (req,res) => {
        try {
            res.set('Content-Type', Prom.register.contentType);
            res.end(await Prom.register.metrics());
        } catch (e) {
            res.status(500).end(e);
        }
    })
    app.use('/v1/user', authRouter);
}
