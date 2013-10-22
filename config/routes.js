

// helpers
var loggedIn = require('./middleware/loggedIn');

var UserHandler  = require('../app/routes/user');
var StaticHandler  = require('../app/routes/static');

// sub route handlers
var errors = require('../app/routes/error');
var challengesController = require('../app/controllers/challenges-controller');



module.exports = exports = function(app, db) {

    var userHandler   = new UserHandler(db);
    var staticHandler = new StaticHandler(db);

    /*
     *  STATIC PAGES
     */

    // GET index (static page for now)
    app.get('/', staticHandler.displayIndex);
    //app.get('/contact', staticHandler.displayContact);


    /**
     * USER ROUTES
     */

    // register new user
    app.get('/register', function (req, res) {
      res.render('users/register', {
          title: "Register to Nock.",
          exists: res.exists || false,
          invalid: res.invalid || false
        });
    });

    app.post('/users', userHandler.registerUser);
    app.post('/api/users', userHandler.registerUserJSON);

    // GET all users
    app.get('/users', userHandler.displayUsers);
    app.get('/api/users', userHandler.displayUsersJSON);

    // GET one user by :name
    app.get('/users/:id', userHandler.getUserByName);
    app.get('/api/users/:id', userHandler.getUserByNameJSON);

    // GET login page
    app.get('/login', function (req, res) {
      res.render('users/login', {
          title: "Please log in.",
          invalid: res.invalid || false
        });
    });

    // GET logout
    app.get('/logout', userHandler.logoutUser);

    // POST login
    app.post('/users/login', userHandler.handleLogin);
    app.post('/api/users/login', userHandler.handleLoginJSON);

    // POST /users => add new users
    app.post('/users/:id', userHandler.updateUserLocation);
    app.post('/api/users/:id', userHandler.updateUserLocation);


    // CHALLENGE ROUTES
    //challenges(app);
    app.get('/challenges', challengesController.index)
    app.get('/challenges/new', challengesController.new)
    app.post('/challenges', challengesController.create)
    app.get('/challenges/:id', challengesController.show)
    app.get('/challenges/:id/edit', challengesController.edit)
    app.put('/challenges/:id', challengesController.update)
    app.del('/challenges/:id', challengesController.destroy)
    app.get('/api/challenges', challengesController.apiIndex)
    app.get('/api/challenges/:id', challengesController.apiShow)


    // ERROR HANDLING
    errors(app);

}