module.exports = (app) => {
    require('./user')(app);
    require('./views')(app);
};
