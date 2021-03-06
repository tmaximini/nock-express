
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var express = require('express');
var http = require('http')

http.globalAgent.maxSockets = 1000; // concurrent requests

require('express-mongoose');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var models = require('./app/models');
var middleware = require('./config/middleware');
var routes = require('./config/routes');

var app = express();

app.set('port', process.env.PORT || config.port || 3000);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

// database
mongoose.connect(config.db);

// middleware
middleware(app);

// Application routes
routes(app);

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

// export app so we can test it
exports = module.exports = app;
