var express = require('express');
var MongoStore = require('connect-mongo')(express);
var path = require('path'); // Path helpers

var env = process.env.NODE_ENV || 'development'
var settings = require('../../config/config')[env];

module.exports = function (app) {

  app.use(express.favicon());

  if (env == 'development') {
    app.use(express.logger('dev'));
  }

  app.use(express.cookieParser());
  // store sessions in mongo
  app.use(express.session({
    secret: settings.cookie_secret,
    store: new MongoStore({
      db: 'nock_sessions'
    })
  }));

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, '../public')));

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