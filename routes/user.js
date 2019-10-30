const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user');

module.exports = (app) => {
    router.post('/register', userController.register);
    router.post('/verify/resend', userController.resendVerificationToken);
    router.post('/verify/:token', userController.verify);
    router.post('/login', userController.login);
    router.post('/change-password', passport.authenticate('jwt', {session: false}), userController.changePassword);
    router.post('/forgot-password', userController.forgotPassword);
    router.post('/forgot-password-change', userController.changeForgottenPassword);

    app.use('/auth', router);
};
