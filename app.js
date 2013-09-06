
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express() // Web framework to handle routing requests
  , cons = require('jade') // Templating library adapter for Express
  , path = require('path') // Path helpers
  , MongoClient = require('mongodb').MongoClient // Driver for connecting to MongoDB
  , routes = require('./routes'); // Routes for our application

var app = express();

MongoClient.connect('mongodb://localhost:27017/nock', function(err, db) {
    "use strict";
    if(err) {
      console.log("error");
      throw err;
    }

    // Register our templating engine
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    // Application routes
    routes(app, db);

    app.listen(3000);
    console.log('Express server listening on port 3000');
});
