var express = require('express');
var path = require('path'); // Path helpers

module.exports = function (app) {

  app.use(express.favicon());
  app.use(express.logger('dev'));

  app.use(express.session({ secret: 'building a web app'} ));

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