const logger = require('../services/logger');
const db = require('../models');
const {User, sequelize} = db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Op} = require('sequelize');
const {ResourceNotFoundError, AuthenticationError, OperationNotAllowedError, AuthorizationError} = require('../services/errors');

exports.createUser = async (data) => {
    try {
        data.password = await bcrypt.hash(data.password, +process.env.BCRYPT_SALT);
        let user = User.findOne({where: {username: data.username}});
        if (user && user.id) throw new OperationNotAllowedError('This username is taken');
        user = User.findOne({where: {email: data.email}});
        if (user && user.id) throw new OperationNotAllowedError('This email already has an account linked to it');
        return User.create(data);
    } catch (err) {
        throw(err);
    }
};

exports.findByPk = (id) => {
    return User.findByPk(id);
};

exports.login = async (data) => {
    try {
        const user = await User.findOne({where: {email: data.email}});
        if (user && user.id && await bcrypt.compare(data.password, user.password)) {
            let user_ = user.dataValues;
            const payload = {id: user.id};
            user_.jwt = await jwt.sign(payload, process.env.SECRET_OR_KEY);
            return user_;
        } else {
            throw new AuthenticationError('Wrong Credentials.');
        }
    } catch (err) {
        throw(err);
    }
};

exports.changePassword = async (data, userId) => {
    const user = await User.findByPk(userId);
    if (!user || !user.id) throw new AuthorizationError('You are not authorized to perform this operation');
    if (await bcrypt.compare(data.current_password, user.password)) {
        return user.update({password: await bcrypt.hash(data.password, +process.env.BCRYPT_SALT)});
    } else {
        throw new AuthenticationError('Wrong credentials. Please input correct password.');
    }
};
