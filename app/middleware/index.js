var express = require('express');
var MongoStore = require('connect-mongo')(express);
var path = require('path'); // Path helpers
var flash = require('connect-flash');

var env = process.env.NODE_ENV || 'development'
var config = require('../../config/config')[env];

module.exports = function (app) {

  app.use(express.favicon());

  if (env == 'development') {
    app.use(express.logger('dev'));
  }

  // store sessions in mongo in production

  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.cookie_secret,
    maxAge: 60000,
    store: new MongoStore({
      db: 'nock_sessions'
    })
  }));


  // for flash messages
  app.use(flash());

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, '../public')));

  // adds CSRF support
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.csrf());
  }
  // This could be moved to view-helpers
  app.use(function(req, res, next){
    res.locals.csrf_token = req.csrfToken();
    next();
  });

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  }

  if ('production' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // expose session and url to views
  app.use(function (req, res, next) {
    res.locals.session = req.session;
    res.locals.url = req.url;
    res.locals.links = [
      {
        "url": "/challenges",
        "name": "Challenges"
      },
      {
        "url": "/locations",
        "name": "Locations"
      },
      {
        "url": "/users",
        "name": "Users"
      }
    ]

    next();
  });

}