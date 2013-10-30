

// helpers
var loggedIn = require('./middleware/loggedIn');

var mongoose = require('mongoose');
var Challenge = mongoose.model('Challenge');
var Location = mongoose.model('Location');

var StaticHandler  = require('../app/handlers/static');

// sub route handlers
var errorHandler = require('../app/handlers/error');
var challengesController = require('../app/controllers/challenges-controller');
var usersController = require('../app/controllers/users-controller');
var locationsController = require('../app/controllers/locations-controller');



module.exports = exports = function(app, db) {

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
    app.param('challenge',                 challengesController.load);
    app.get('/challenges',                 challengesController.index);
    app.get('/challenges/new',             challengesController.new);
    app.post('/challenges',                challengesController.create);
    app.get('/challenges/:challenge',      challengesController.show);
    app.get('/challenges/:challenge/edit', challengesController.edit);
    app.put('/challenges/:challenge',      challengesController.update);
    app.del('/challenges/:challenge',      challengesController.destroy);
    app.get('/api/challenges',             challengesController.apiIndex);
    app.get('/api/challenges/:challenge',  challengesController.apiShow);




    /**
     * LOCATION ROUTES (CRUD)
     */
    app.param('location',                locationsController.load);
    app.get('/locations',                locationsController.index);
    app.get('/locations/new',            locationsController.new);
    app.post('/locations',               locationsController.create);
    app.get('/locations/:location',      locationsController.show);
    app.get('/locations/:location/edit', locationsController.edit);
    app.put('/locations/:location',      locationsController.update);
    app.del('/locations/:location',      locationsController.destroy);
    app.get('/api/locations',            locationsController.apiIndex);
    app.get('/api/locations/:location',  locationsController.apiShow);



    /**
     *  LOCATION WEBSERVICES
     */

    app.post('/api/getLocationData', locationsController.matchFourSquareIds)


    // ERROR HANDLING
    errorHandler(app);

}