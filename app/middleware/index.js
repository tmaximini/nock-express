var express = require('express');
var MongoStore = require('connect-mongo')(express);
var path = require('path'); // Path helpers

module.exports = function (app) {

  app.use(express.favicon());
  app.use(express.logger('dev'));

  console.dir(settings);

  app.use(express.session({
    secret: settings.cookie_secret,
    store: new MongoStore({
      db: settings.db
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