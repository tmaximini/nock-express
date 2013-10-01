
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var express = require('express');
require('express-mongoose');


var models = require('./app/models');
var middleware = require('./app/middleware');
var routes = require('./app/routes');

mongoose.connect('mongodb://localhost:27017/nock', function(err) {
    "use strict";
    if (err) {
      console.log("error");
      throw err;
    }

    var db = mongoose.connection;
    var app = express();

    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');

    // middleware
    middleware(app);

    // Application routes
    routes(app, db);

    app.listen(3000);
    console.log('Express server listening on port 3000');
});
