const path = require('path');

/**
 * Setup express
 */
const express = require('express');
const app = express();

/**
 * Setup handlebars
 */
app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');

/**
 * Setup Morgan
 */
const morgan = require('morgan');
app.use(morgan('combined'));

/**
 *
 * Use gzip compression
 */
const compression = require('compression');
app.use(compression());

/**
 *
 * Use Helmet to setup http headers correctly
 */
const helmet = require('helmet');
app.use(helmet());

/**
 * Setup body parser
 */
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

/**
 * Setup CORS
 */
const cors = require('cors');
const corsOptions = {
    // origin: 'http://localhost:4200'
};
app.use(cors(corsOptions));



/**
 * rate limiter
 */
const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use("/api/", apiLimiter);

// const createAccountLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour window
//     max: 5, // start blocking after 5 requests
//     message:
//         "Too many accounts created from this IP, please try again after an hour"
// });
// app.post("/create-account", createAccountLimiter, function(req, res) {
//     //...
// });



/**
 * Setup Passport
 */
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');
const userHandler = require('./handlers/user');
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_OR_KEY
};
const strategy = new JwtStrategy(opts, (payload, next) => {
    userHandler.findByPk(payload.id)
        .then(user => {
            next(null, user)
        })
        .catch(err => {
            throw err;
        });
});
passport.use(strategy);
app.use(passport.initialize());

/**
 * Routes
 */
require('./routes')(app);

// var etag = require('etag');
// res.setHeader('ETag', etag(body));


module.exports = app;
