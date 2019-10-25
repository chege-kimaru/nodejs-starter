const logger = require('./logger');
const {
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    OperationNotAllowedError
} = require('./errors');

module.exports = (res, err) => {
    logger.error(err);
    if (err instanceof require('sequelize').ValidationError) {
        let errors = err.errors.map(e => {
            return e.message;
        });
        res.status(400).json({errors: errors});
    } else if (err instanceof OperationNotAllowedError) {
        let errors = [];
        errors.push(err.message);
        res.status(400).json({errors: errors});
    } else if (err instanceof ResourceNotFoundError) {
        res.status(404).json({error: err.message});
    } else if (err instanceof AuthenticationError || err instanceof AuthorizationError) {
        res.status(401).json({error: err.message})
    } else {
        res.status(500).json({error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'});
    }
};

