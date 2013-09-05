var ErrorHandler = require('./error').errorHandler
  , UserHandler  = require('./user');

module.exports = exports = function(app, db) {

    var userHandler = new UserHandler(db);

    // GET all users
    app.get('/users', userHandler.displayUsers);

    // Error handling middleware
    app.use(ErrorHandler);
}