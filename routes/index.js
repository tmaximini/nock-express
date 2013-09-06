var ErrorHandler = require('./error').errorHandler
  , UserHandler  = require('./user');

module.exports = exports = function(app, db) {

    var userHandler = new UserHandler(db);

    // GET all users
    app.get('/users', userHandler.displayUsers);

    // GET one user by :name
    app.get('/users/:name', userHandler.getUserByName);

    // Error handling middleware
    app.use(ErrorHandler);
}