const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user');

module.exports = (app) => {
    router.get('/auth/verify', (req, res) => res.render('verifyUser'));
    router.get('/auth/change-forgot-password', (req, res) => res.render('changeForgotPassword'));

    app.use('/views', router);
};
