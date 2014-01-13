

// helpers
var loggedIn = require('./middleware/loggedIn');
var adminOnly = require('./middleware/isAdmin');

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

    // STATIC website pages for www.getnock.com
    app.get('/admin', staticHandler.displayIndex);

    app.get('/', staticHandler.displayWebsite);
    app.get('/website', staticHandler.displayWebsite);
    app.get('/provider', staticHandler.displayProvider);
    app.get('/imprint', staticHandler.displayImprint);
    app.get('/contact', staticHandler.displayContact);
    app.get('/company', staticHandler.displayCompany);




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

    app.param('user', usersController.load);

    app.post('/users', usersController.register);
    app.post('/api/users', usersController.apiRegister);

    // GET all users
    app.get('/users', loggedIn, usersController.index);
    app.get('/api/users', usersController.apiIndex);

    // GET one user by :name
    app.get('/users/:user', usersController.show);
    app.get('/api/users/:user', usersController.apiShow);

    // GET login page
    app.get('/login', function (req, res) {
      res.render('users/login', {
          title: "Please log in.",
          invalid: res.invalid || false,
          flashs: req.flash('info')
        });
    });

    // GET logout
    app.get('/logout', usersController.logout);

    // POST login
    app.post('/users/login', usersController.login);
    app.post('/api/users/login', usersController.apiLogin);

    // POST /users => add new users
    app.post('/users/:user', usersController.apiUpdate);
    app.post('/api/users/:user', usersController.apiUpdate);

    // GET locations around user
    app.get('/api/users/:user/nearby', usersController.apiGetLocationsNearby);


    /**
     * CHALLENGE ROUTES
     */
    app.param('challenge', challengesController.load);
    app.get('/challenges', adminOnly, challengesController.index);
    app.get('/challenges/new', adminOnly, challengesController.new);
    app.post('/challenges', adminOnly, challengesController.create);
    app.get('/challenges/:challenge', adminOnly, challengesController.show);
    app.get('/challenges/:challenge/edit', adminOnly, challengesController.edit);
    app.put('/challenges/:challenge', adminOnly, challengesController.update);
    app.del('/challenges/:challenge', adminOnly, challengesController.destroy);
    app.get('/challenges/:challenge/attempts', loggedIn, challengesController.showAttempts);
    app.get('/api/challenges', loggedIn, challengesController.apiIndex);
    app.get('/api/challenges/search', loggedIn, challengesController.apiSearch);
    app.get('/api/challenges/:challenge', loggedIn, challengesController.apiShow);
    app.post('/api/challenges/:challenge/attempts', loggedIn, challengesController.apiAddAttempt);




    /**
     * LOCATION ROUTES (CRUD)
     */
    app.param('location', locationsController.load);
    app.get('/locations', adminOnly, locationsController.index);
    app.get('/locations/new', adminOnly, locationsController.new);
    app.post('/locations', adminOnly, locationsController.create);
    app.get('/locations/:location', locationsController.show);
    app.get('/locations/:location/edit', adminOnly, locationsController.edit);
    app.put('/locations/:location', adminOnly, locationsController.update);
    app.del('/locations/:location', adminOnly, locationsController.destroy);
    app.get('/api/locations', locationsController.apiIndex);
    app.get('/api/locations/:location', locationsController.apiShow);
    app.get('/api/locations/:location/addChallenge', adminOnly, locationsController.apiAddChallenge);



    /**
     *  LOCATION WEBSERVICES
     */

    // app.post('/api/getLocationData', locationsController.matchFourSquareIds);


    // ERROR HANDLING
    errorHandler(app);

}