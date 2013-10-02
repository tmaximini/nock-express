
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var express = require('express');
require('express-mongoose');

var env = process.env.NODE_ENV || 'development'
var settings = require('./config/config')[env];

var models = require('./app/models');
var middleware = require('./app/middleware');
var routes = require('./app/routes');

mongoose.connect(settings.db, function(err) {
    "use strict";

    if (err) {
      console.log("error");
      throw err;
    }

    var app = express();

    app.set('port', process.env.PORT || settings.port || 3000);
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');

    // middleware
    middleware(app);

    // Application routes
    routes(app);

    app.listen(app.get('port'));
    console.log('Express server listening on port ' + app.get('port'));
});
