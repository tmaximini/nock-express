
var UserHandler  = require('./user');
var StaticHandler  = require('./static');

// sub route handlers
var errors = require('./error');
var challenges = require('./challenges');



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
     * USER STUFF
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

    // GET all users
    app.get('/users', userHandler.displayUsers);
    app.get('/api/users', userHandler.displayUsersJSON);

    // GET one user by :name
    app.get('/users/:username', userHandler.getUserByName);
    app.get('/api/users/:username', userHandler.getUserByNameJSON);

    // GET login page
    app.get('/login', function (req, res) {
      res.render('users/login', {
          title: "Please log in.",
          invalid: res.invalid || false
        });
    });

    // POST login
    app.post('/users/login', userHandler.handleLogin);
    app.post('/api/users/login', userHandler.handleLogin);

    // POST /users => add new users
    app.post('/users/:id', userHandler.updateUser);
    app.post('/api/users/:id', userHandler.updateUser);


    // handle challenges
    challenges(app);


    // handle errors
    errors(app);

}