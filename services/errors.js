class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class OperationNotAllowedError extends BaseError {
}

class AuthenticationError extends BaseError {
}

class AuthorizationError extends BaseError {
}

class ResourceNotFoundError extends BaseError {
}



module.exports = {
    OperationNotAllowedError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError
};
