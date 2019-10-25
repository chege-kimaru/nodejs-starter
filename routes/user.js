const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user');

module.exports = (app) => {
    router.post('/register', userController.register);
    router.post('/login', userController.login);
    router.post('/change-password', passport.authenticate('jwt', {session: false}), userController.changePassword);

    app.use('/auth', router);
};
