
var UserHandler  = require('./user');
var StaticHandler  = require('./static');

// error handler
var errors = require('./error');

module.exports = exports = function(app, db) {

    var userHandler   = new UserHandler(db);
    var staticHandler = new StaticHandler(db);

    // GET index (static page for now)
    app.get('/', staticHandler.displayIndex);

    // GET all users
    app.get('/users', userHandler.displayUsers);
    app.get('/api/users', userHandler.displayUsersJSON);

    // GET one user by :name
    app.get('/users/:username', userHandler.getUserByName);
    app.get('/api/users/:username', userHandler.getUserByNameJSON);

    // POST login
    app.post('/users/login', userHandler.handleLogin);
    app.post('/api/users/login', userHandler.handleLogin);

    // POST /users => add new users
    app.post('/users/:id', userHandler.updateUser);
    app.post('/api/users/:id', userHandler.updateUser);


    // handle errors
    errors(app);

}