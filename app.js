/**
 * Setup express
 */
const express = require('express');
const app = express();

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


module.exports = app;
