var mongoose = require('mongoose');
var User = mongoose.model('User');
var Location = mongoose.model('Location');

var cleanString = require('../helpers/cleanString');
var hash = require('../helpers/hash');
var crypto = require('crypto');
var utils = require('../../lib/utils');

var Promise = require('bluebird');

var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];
var FS = config.foursquare;
var request = require('request');
var LRU = require('lru-cache'); // least recent used cache
var geolib = require('geolib');

var cacheOptions = { max: 500, maxAge: 1000 * 60 * 60 * 24 }; // 24h

var cache = LRU(cacheOptions);

'use strict';


exports.load = function(req, res, next, id) {
  User.load(id, function (err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('not found'));
    req.user = user;
    next();
  });
}


/**
 * displays all users
 */
exports.index = function(req, res, next) {
  // limit to 20 users for now
  User.find()
      .select({ 'salt':0, 'hash': 0, '__v':0 })
      .sort('username')
      .limit(10)
      .exec(function (err, users) {
        if (err) return next(err);
        res.render('users/index', {
          title: 'User Listing',
          users: users
        });
  });
}


/**
 * displays one user
 */
 exports.show = function (req, res, next) {
  // extract name from params
  var user = req.user;

  if (user) {
    // answer with JSON only atm
    res.render('users/show', {
      title: 'User Details',
      user: user
    });
  } else {
    console.log('user not found! error....');
    return res.render('404', { title: 'User not found', errorMessage: 'The user you requested does not exist.' });
  }
}


/*
 * handles user login
 * @req.param username
 * @req.param password
 */
exports.login = function (req, res, next) {
  // validate input
  var username = cleanString(req.param('username'));
  var pass = cleanString(req.param('pass'));
  if (!(username && pass)) {
    return invalid();
  }

  // user friendly
  username = username.toLowerCase();

  // query mongodb
  User.findById(username, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return invalid();
    }

    // check pass
    if (user.hash != hash(pass, user.salt)) {
      return invalid();
    }

    req.session.isLoggedIn = true;
    req.session.user = user.username;
    req.session.admin = user.admin;
    res.redirect('/');
  });
  function invalid () {
    req.flash('error', 'Benutzername oder Passwort falsch.');
    return res.render('users/login.jade', {
      invalid: true,
      messages: req.flash('error'),
      flashs: [],
      title: 'Please log in.'
    });
  }
}


// this will be called to insert user from our html form, where
// we know exactly which fields we use and we can validate the input correctly
exports.register = function (req, res, next) {

  var email = cleanString(req.param('email'));
  var username = cleanString(req.param('username'));
  var pass = cleanString(req.param('pass'));

  //console.dir(req.body);

  if (!(email && pass && username)) {
    return invalid();
  }

  User.findById(username, function (err, user) {
    if (err) return next(err);

    if (user) {
      console.error('user exists already');
      return  res.render('users/register.jade', {
                invalid: false,
                title: 'Register to Nock',
                exists: true
              });
    }

    crypto.randomBytes(16, function (err, bytes) {
      if (err) return next(err);

      var user = { _id: username };
      user.email = email;
      user.username = username;
      user.provider = 'email';
      user.salt = bytes.toString('utf8');
      user.hash = hash(pass, user.salt);

      User.create(user, function (err, newUser) {
        if (err) {
          if (err instanceof mongoose.Error.ValidationError) {
            console.log('invalid user creation: ', err)
            return invalid();
          }
          return next(err);
        }

        // user created successfully
        req.session.isLoggedIn = true;
        req.session.user = username;
        console.log('created user: %s (%s)', username, email);
        return res.redirect('/');
      });
    });
  });

  function invalid () {
    return res.render('users/register.jade', {
      invalid: true,
      title: 'Register to Nock',
      exists: false
    });
  }

}

exports.logout = function (req, res) {
  req.session.isLoggedIn = false;
  req.session.user = null;
  req.session.token = null;
  res.redirect('/');
}


/*--------------------------------------------------
 *  API STUFF - json methods
 *--------------------------------------------------*/


// FIXME: replace with User.list static

exports.apiIndex = function(req, res, next) {
    // limit to 20 users for now
    User.find()
        .select({'salt':0, 'hash': 0, '__v':0}) // omit fields
        .sort('username')
        .limit(20)
        .exec(function (err, users) {
          if (err) return next(err);
          res.json({'users': users});
    });
}


// FIXME: replace with User.load static

exports.apiShow = function (req, res, next) {
  // extract name from params
  var user = req.user;
  if (user) {
    // answer with JSON only atm
    res.json(user);
  } else {
    console.log('user not found! error....');
    next(new Error('User not found!'));
  }
}

/**
 * Handles Login for Nock iOS APP / webservice
 */
 exports.apiLogin = function (req, res, next) {

  //console.log('incoming login request: ');
  //console.dir(req.body);

  // validate input
  var username = cleanString(req.param('username'));
  var pass = cleanString(req.param('password'));
  if (!(username && pass)) {
    return invalid();
  }

  // query mongodb
  User.findById(username, function (err, user) {
    if (err) return next(err);

    if (!user) {
      // create User if not exist
      console.log('user not found');
      next();
    }

    // check pass
    if (!user || (user.hash != hash(pass, user.salt))) {
      return invalid();
    } else {
      req.session.isLoggedIn = true;
      req.session.user = username;
      user.sessionToken = req.session['_id']
      res.json(user);
    }

  });
  function invalid () {
    res.status(404);
    return res.json({ 'error' : 'User is invalid. mofo' });
  }
}


exports.apiUpdate = function (req, res, next) {
  // extract id from params
  var id = req.params.user;
  var data = req.body;

  console.log('updating user ' + id + ' with data:');
  console.dir(req.body);

  User.edit(req, function (err) {
    if (err) {
      console.error(err);
      return next(err);
    } else {
      return res.json({'status':'success', 'action': 'position updated'});
    }
  });
}


exports.apiRegister = function (req, res, next) {

  //console.log('Requesting new User registration:');
  //console.dir(req.body);

  var username = cleanString(req.param('username'));
  var pass = cleanString(req.param('password'));
  var points = 0;
  var fbUserName = req.param('fbUserName');
  if (!(username && pass)) {
    return res.status(400).send('bad request. needs username und password.')
  }

  User.findById(username, function (err, user) {
    if (err) return next(err);

    if (!user) {
      // create User if not exist
      crypto.randomBytes(16, function (err, bytes) {
        if (err) return next(err);
        var user      = { _id: username };
        user.username = fbUserName;
        user.points   = points;
        user.salt     = bytes.toString('utf8');
        user.hash     = hash(pass, user.salt);
        user.provider = 'Facebook';

        User.create(user, function (err, newUser) {
          if (err) {
            if (err instanceof mongoose.Error.ValidationError) {
              console.error('mongoose validation failed');
              return invalid();
            }
            return next(err);
          }

          // user created successfully
          req.session.isLoggedIn = true;
          req.session.user = username;
          console.log('created user: %s', username);
          return res.redirect('/api/users/' + username);
        });
      });
    } else {
      console.log('user exists already');
      return res.status(400).json({'error': 'User Id exists already'});
    }
  });

}


/**
 * Matches Foursquare Locations to Nock Locations by comparing FourSquare IDs
 */
exports.apiGetLocationsNearby = function (req, res, next) {

  var user = req.user;

  // truncate user location to 8 digits after comma to improve cache rate
  user.location[0] = parseFloat(user.location[0].toFixed(8));
  user.location[1] = parseFloat(user.location[1].toFixed(8));


  var tryCache = cache.get(user.location.toString());

  if (tryCache) {
    // many cache, such perform... wow
    console.log('serving request from cache!');
    return res.status(200).send(JSON.parse(tryCache));
  } else {

    var highlighted = 0;
    var maxHighlighted = 3;

    // no cache found, make request
    console.log('no cache object found, requesting foursquare...');
    request({
      method: 'GET',
      timeout: 6000,
      uri: FS.url + 'search',
      qs: {
        client_id: FS.clientID,
        v: FS.version,
        client_secret: FS.clientSecret,
        categoryId: FS.categoryId,
        radius: 500,
        ll: user.location.toString()
      }
    }, function (error, response, body) {
      if (response && response.statusCode === 200) {

        // parse JSON response into an JS object
        var responseObj = JSON.parse(body).response;

        var challengePromises = [];
        var photoPromises = [];

        var nockObj = {
          id: user.location.toString(),
          venues: {}
        };

        // match foursquare ids to our location objects and inject needed properties
        responseObj.venues.forEach(function (venue) {

          nockObj.venues[venue.id] = venue;
          nockObj.venues[venue.id].highlight = false;

          delete nockObj.venues[venue.id].events;
          delete nockObj.venues[venue.id].specials;
          delete nockObj.venues[venue.id].stats;
          delete nockObj.venues[venue.id].hereNow;
          delete nockObj.venues[venue.id].categories;

          console.log('venue: ' + venue.id);
          challengePromises.push(Location.getChallengeData(venue.id));
          photoPromises.push(getImageData(venue.id));
        });


        Promise.all(photoPromises).then(function(photoResults) {

          Promise.all(challengePromises).then(function(results) {
            console.log('all promises resolved yay', results.length );

            for (var i = 0; i < results.length; i++) {

              if (nockObj.venues[results[i].fourSquareId]) {

                nockObj.venues[results[i].fourSquareId].photos = photoResults[i];
                nockObj.venues[results[i].fourSquareId].nock = results[i];

                if (results[i].challenges.length > 0 && (highlighted <= maxHighlighted)) {
                  nockObj.venues[results[i].fourSquareId].highlight = true;
                  highlighted++;
                } else {
                  nockObj.venues[results[i].fourSquareId].highlight = false;
                }

              }
            }

            // cache modified response for next request
            cache.set(user.location.toString(), JSON.stringify(nockObj));
            return res.status(200).send(nockObj);

          });

          // cache modified response for next request
          cache.set(user.location.toString(), JSON.stringify(nockObj));
          return res.status(200).json(nockObj);

        });
      } else {
        console.error(error);
        console.log(body);
        res.status(404).json( { 'error': 'FourSquare sucks.' } );
      }

    });
  }
}

function getImageData (locationId) {
  var q = Promise.defer();
  request({
    method: 'GET',
    timeout: 3000,
    uri: FS.url + locationId.toString() + '/photos',
    qs: {
      client_id: FS.clientID,
      v: FS.version,
      client_secret: FS.clientSecret,
      limit: 5
    }
  }, function (error, response, body) {
    if (response && response.statusCode === 200) {
      console.log('request to ' + locationId + ' worked!');
      var photos = JSON.parse(body).response.photos.items;
      for (var i = 0; i < photos.length; i++) {
        delete photos[i].user;
        delete photos[i].id;
        delete photos[i].source;
      };
      q.resolve(photos);
    } else {
      console.log('request to ' + locationId + ' failed!');
      q.resolve({});
    }
  });
  return q.promise;
}


