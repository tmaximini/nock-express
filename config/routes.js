

// helpers
var loggedIn = require('./middleware/loggedIn');

var UserHandler  = require('../app/routes/user');
var StaticHandler  = require('../app/routes/static');

// sub route handlers
var errors = require('../app/routes/error');
var challengesController = require('../app/controllers/challenges-controller');
var usersController = require('../app/controllers/users-controller');



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

    app.post('/users', usersController.register);
    app.post('/api/users', usersController.apiRegister);

    // GET all users
    app.get('/users', usersController.index);
    app.get('/api/users', usersController.apiIndex);

    // GET one user by :name
    app.get('/users/:id', usersController.show);
    app.get('/api/users/:id', usersController.apiShow);

    // GET login page
    app.get('/login', function (req, res) {
      res.render('users/login', {
          title: "Please log in.",
          invalid: res.invalid || false
        });
    });

    // GET logout
    app.get('/logout', usersController.logout);

    // POST login
    app.post('/users/login', usersController.login);
    app.post('/api/users/login', usersController.apiLogin);

    // POST /users => add new users
    app.post('/users/:id', usersController.updateLocation);
    app.post('/api/users/:id', usersController.updateLocation);


    /**
     * CHALLENGE ROUTES
     */

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