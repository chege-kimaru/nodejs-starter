exports.isProduction = () => {
    const environment = process.env.NODE_ENV || 'development';
    return environment === 'production';
};
