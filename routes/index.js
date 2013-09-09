
var UserHandler  = require('./user');

module.exports = exports = function(app, db) {

    var userHandler = new UserHandler(db);

    // GET all users
    app.get('/users', userHandler.displayUsers);
    app.get('/api/users', userHandler.displayUsersJSON);

    // GET one user by :name
    app.get('/users/:name', userHandler.getUserByName);
    app.get('/api/users/:name', userHandler.getUserByNameJSON);


    // POST /users => add new users
    app.post('/users', userHandler.newGenericUser);

}