
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , app = express() // Web framework to handle routing requests
  , middleware = require('./app/middleware')
  , MongoClient = require('mongodb').MongoClient // Driver for connecting to MongoDB
  , routes = require('./app/routes'); // Routes for our application


require('jade');
var app = express();

mongoose.connect('mongodb://localhost:27017/nock', function(err) {
    "use strict";
    if (err) {
      console.log("error");
      throw err;
    }

    var db = mongoose.connection;

    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    // middleware
    middleware(app);

    // Application routes
    routes(app, db);

    app.listen(3000);
    console.log('Express server listening on port 3000');
});
