const logger = require('../services/logger');
const userHandler = require('../handlers/user');
const errorHandler = require('../services/errorHandler');
const {validateFields} = require('../services/validateFields');
const {OperationNotAllowedError} = require('../services/errors');
const passport = require('passport');
const {getFullServerUrl} = require('../services/common');

exports.register = async (req, res) => {
    try {
        const valid = await validateFields(req, res, {
            username: 'required',
            email: 'required',
            password: 'required',
        });
        if (!valid) return;

        const data = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        };

        res.status(201).json(await userHandler.createUser(data, getFullServerUrl(req)));
    } catch (err) {
        errorHandler(res, err)
    }
};

exports.verify = async (req, res) => {
    try {
        const token = req.params.token;
        res.status(200).json(await userHandler.verifyToken(token));
    } catch (err) {
        errorHandler(res, err)
    }
};

exports.resendVerificationToken = async (req, res) => {
    try {
        const valid = await validateFields(req, res, {
            email: 'required'
        });
        if (!valid) return;

        const email = req.body.email;
        res.status(200).json(await userHandler.resendVerificationToken(email, getFullServerUrl(req)));
    } catch (err) {
        errorHandler(res, err)
    }
};

exports.login = async (req, res) => {
    try {
        const valid = await validateFields(req, res, {
            email: 'required|email',
            password: 'required',
        });
        if (!valid) return;

        const data = {
            email: req.body.email,
            password: req.body.password
        };

        res.status(200).json(await userHandler.login(data));
    } catch (err) {
        errorHandler(res, err)
    }
};

exports.changePassword = async (req, res) => {
    try {
        const valid = await validateFields(req, res, {
            current_password: 'required',
            password: 'required',
        });
        if (!valid) return;

        const data = {
            current_password: req.body.current_password,
            password: req.body.password
        };

        res.status(200).json(await userHandler.changePassword(data, req.user.id));
    } catch (err) {
        errorHandler(res, err)
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const valid = await validateFields(req, res, {
            email: 'required'
        });
        if (!valid) return;

        const email = req.body.email;
        res.status(200).json(await userHandler.forgotPassword(email, getFullServerUrl(req)));
    } catch (err) {
        errorHandler(res, err)
    }
};

exports.changeForgottenPassword = async (req, res) => {
    try {
        const valid = await validateFields(req, res, {
            token: 'required',
            password: 'required'
        });
        if (!valid) return;

        const data = {token: req.body.token, password: req.body.password};

        const email = req.body.email;
        res.status(200).json(await userHandler.changeForgottenPassword(data));
    } catch (err) {
        errorHandler(res, err)
    }
};
