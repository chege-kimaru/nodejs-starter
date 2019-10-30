const logger = require('../services/logger');
const db = require('../models');
const {User, UserVerificationToken, ForgotPasswordToken, sequelize} = db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Op} = require('sequelize');
const {ResourceNotFoundError, AuthenticationError, OperationNotAllowedError, AuthorizationError} = require('../services/errors');
const uuid = require('uuid/v4');
const moment = require('moment');
const Mailer = require('../services/mailer');

const sendVerificationEmail = async (user, token, serverUrl) => {
    const m = new Mailer();
    await m.send({
        template: 'userVerification',
        message: {
            to: user.email
        },
        locals: {
            user: user.email,
            link: `${serverUrl}/views/auth/verify?token=${token.token}`
        }
    });
};

exports.createUser = async (data, serverUrl) => {
    try {
        data.password = await bcrypt.hash(data.password, +process.env.BCRYPT_SALT);
        let user = await User.findOne({where: {username: data.username}});
        if (user && user.id) throw new OperationNotAllowedError('This username is taken');
        user = await User.findOne({where: {email: data.email}});
        if (user && user.id) throw new OperationNotAllowedError('This email already has an account linked to it');
        return sequelize.transaction(transaction => {
            return User.create(data, {transaction}).then(user => {
                return UserVerificationToken.create({
                    user_id: user.id,
                    token: uuid(),
                    expiry: moment().add(+process.env.USER_VERIFICATION_TOKEN_EXPIRY_HOURS, "hours")
                }, {transaction}).then(token => {
                    sendVerificationEmail(user, token, serverUrl);
                    delete user.password;
                    return user;
                })
            });
        });
    } catch (err) {
        throw(err);
    }
};

exports.verifyToken = (token) => {
    return UserVerificationToken.findOne({where: {token}}).then(token => {
        if (!token || !token.id) throw new OperationNotAllowedError('Verification failed. Please use the link sent to your email.');
        if (new Date() > token.expiry) throw new OperationNotAllowedError('Verification failed. This link has expired. Please request for a new one.');
        return token.getUser().then(user => {
            if (user.verified) throw new OperationNotAllowedError('This account is already verified. Please login to continue.');
            return user.update({verified: true}).then(user => {
                delete user.password;
                return user;
            });
        })
    })
};

exports.resendVerificationToken = (email, serverUrl) => {
    return User.findOne({where: {email}}).then(user => {
        if (!user || !user.id) throw new ResourceNotFoundError('This account does not exist');
        if (user.verified) throw new OperationNotAllowedError('This account has already been verified');
        return user.getUserVerificationToken().then(token => {
            if (token && token.id)
                return token.update({
                    token: uuid(),
                    expiry: moment().add(+process.env.USER_VERIFICATION_TOKEN_EXPIRY_HOURS, "hours")
                }).then(token => {
                    return sendVerificationEmail(user, token, serverUrl).then(data => {
                        return {data: 'Verification token resent.'};
                    });
                });
            else
                return UserVerificationToken.create({
                    user_id: user.id,
                    token: uuid(),
                    expiry: moment().add(+process.env.USER_VERIFICATION_TOKEN_EXPIRY_HOURS, "hours")
                }).then(token => {
                    return sendVerificationEmail(user, token, serverUrl).then(data => {
                        return {data: 'Verification token resent.'};
                    });
                });
        });
    });
};

exports.findByPk = (id) => {
    return User.findByPk(id).then(user => {
        delete user.password;
        return user;
    });
};

exports.login = async (data) => {
    try {
        const user = await User.findOne({where: {email: data.email}});
        if (user && user.id && await bcrypt.compare(data.password, user.password)) {
            let user_ = user.dataValues;
            const payload = {id: user.id};
            user_.jwt = await jwt.sign(payload, process.env.SECRET_OR_KEY);
            delete user_.password;
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
        return user.update({password: await bcrypt.hash(data.password, +process.env.BCRYPT_SALT)}).then(user => {
            delete user.password;
            return user;
        });
    } else {
        throw new AuthenticationError('Wrong credentials. Please input correct password.');
    }
};

const sendForgotPasswordEmail = async (user, token, serverUrl) => {
    const m = new Mailer();
    await m.send({
        template: 'forgotPassword',
        message: {
            to: user.email
        },
        locals: {
            user: user.email,
            link: `${serverUrl}/views/auth/change-forgot-password?token=${token.token}`
        }
    });
};
exports.forgotPassword = (email, serverUrl) => {
    return User.findOne({where: {email}}).then(user => {
        if (!user || !user.id) throw new ResourceNotFoundError('This account does not exist');

        return user.getForgotPasswordToken().then(token => {
            if (token && token.id)
                return token.update({
                    used: false,
                    token: uuid(),
                    expiry: moment().add(+process.env.FORGOT_PASSWORD_TOKEN_EXPIRY_HOURS, "hours")
                }).then(token => {
                    return sendForgotPasswordEmail(user, token, serverUrl).then(data => {
                        return {data: 'Forgot password id sent to your email.'};
                    });
                });
            else
                return ForgotPasswordToken.create({
                    user_id: user.id,
                    used: false,
                    token: uuid(),
                    expiry: moment().add(+process.env.FORGOT_PASSWORD_TOKEN_EXPIRY_HOURS, "hours")
                }).then(token => {
                    return sendForgotPasswordEmail(user, token, serverUrl).then(data => {
                        return {data: 'Forgot password id sent to your email.'};
                    });
                });
        });
    });
};

exports.changeForgottenPassword = (data) => {
    return ForgotPasswordToken.findOne({where: {token: data.token}}).then(token => {
        if (!token || !token.id) throw new OperationNotAllowedError('Invalid token. Please use the link sent to your email.');
        if (token.used) throw new OperationNotAllowedError('Invalid token. This token has already been used. Please request for another.');
        if (new Date() > token.expiry) throw new OperationNotAllowedError('Invalid token. This link has expired. Please request for a new one.');
        return sequelize.transaction(transaction => {
            return token.getUser({transaction}).then(async user => {
                return user.update({password: await bcrypt.hash(data.password, +process.env.BCRYPT_SALT)}, {transaction})
                    .then(user => {
                        return token.update({used: true}).then(token => {
                            delete user.password;
                            return user;
                        });
                    });
            })
        });
    })
};
