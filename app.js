
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var express = require('express');
require('express-mongoose');

var env = process.env.NODE_ENV || 'development'
var config = require('./config/config')[env];

var models = require('./app/models');
var middleware = require('./app/middleware');
var routes = require('./app/routes');

var app = express();

mongoose.connect(config.db);

app.set('port', process.env.PORT || config.port || 3000);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

// middleware
middleware(app);

// Application routes
routes(app);

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

// export app so we can test it
exports = module.exports = app;
