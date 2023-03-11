const express = require('express');
const app = express();
const addRequestId = require('express-request-id')({setHeader: false});

const helper = require('./app/helpers/helper')
const winston = require('./app/helpers/winston.logger')

require('dotenv').config()

//get request ID
app.use(addRequestId)
app.use(express.json());

app.use(
    express.urlencoded({
        extended: false
    })
)

var router = express.Router();

// var loginRouter = require('./app/controllers/AuthController/routes')
var connectionRouter = require('./app/controllers/connectionController/routes')
var persoRouter = require('./app/controllers/persoController/routes')
var activationRouter = require('./app/controllers/activationController/routes')
var updateCardExpiredRouter = require('./app/controllers/updateCardExpired/routes')
var cardReplacementRouter = require('./app/controllers/cardReplacementController/routes')
var registrationInfoRouter = require('./app/controllers/registrationInfoController/routes')

var loginRouter = require('./app/controllers/loginController/routes')
var addStockRouter = require('./app/controllers/addStockController/routes')
var logoutRouter = require('./app/controllers/logoutController/routes')
// This route will handle all the requests that are 
// not handled by any other route handler. In 
// this handler we will redirect the user to 
// an error page with NOT FOUND message and status
// code as 404 (HTTP status code for NOT found)


app.get("/", (req, res) => {
    res.json({
      message: "Welcome to API Access Card Managemen System.",
    });
  });



//route v1
app.use('/api/v1/', router);

router.use('/connection', connectionRouter)
router.use('/login', loginRouter)
router.use('/addstock', addStockRouter)
router.use('/logout', logoutRouter)
router.use('/persou', persoRouter)
router.use('/activation', activationRouter)
router.use('/update-card-expired', updateCardExpiredRouter)
router.use('/replacement', cardReplacementRouter)
router.use('/registration', registrationInfoRouter)

// app.all('*', (req, res) => {
//     res.status(404).json({
//         message: 'Ohh you are lost, read the API documentation to find your way back home :)'
//     })
// })

const port = process.env.APP_PORT || 3001

app.listen(port, () => {
    // log info
    winston.logger.info(
        `Service ACMS is listening to port ${port}`
    );
})