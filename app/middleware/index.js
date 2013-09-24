var express = require('express');
var MongoStore = require('connect-mongo')(express);
var path = require('path'); // Path helpers

var env = process.env.NODE_ENV || 'development'
var settings = require('../../config/config')[env];

module.exports = function (app) {

  app.use(express.favicon());
  app.use(express.logger('dev'));

  app.use(express.session({
    secret: settings.cookie_secret,
    store: new MongoStore({
      db: 'nock_sessions'
    })
  }));

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // expose session to views
  app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
  });

}