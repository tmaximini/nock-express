var loggedIn = require('../../config/middleware/loggedIn');
var mongoose = require('mongoose');
var Location = mongoose.model('Location');
var Challenge = mongoose.model('Challenge');
var utils = require('../../lib/utils');

"use strict";


exports.load = function(req, res, next, id) {
  Location.load(id, function (err, location) {
    if (err) return next(err);
    if (!location) return next(new Error('location not found'));
    req.location = location;
    next();
  });
}



exports.new = function (req, res, next) {
  res.render('locations/new.jade', {
    title: "Create Location",
    location: new Location({}),
    errors: []
  });
  console.dir(res.locals);
}


exports.create = function (req, res, next) {

  var location = new Location(req.body);

  var locationId = utils.convertToSlug(req.body.name);

  Location.findOne({ 'slug': locationId }, function (err, doc) {
    if (err) return next(err);
    if (doc) {
      console.log("location already exists!");

      return res.status(400).render('locations/new', {
        title: 'New Location',
        location: location,
        errors: ["location with that name already exists"]
      });

    }
    else {
      location.slug = locationId;
      location.uploadAndSave(req.files.image, function (err) {
        if (!err) {
          req.flash('success', 'Successfully created location!');
          console.log('Successfully created location!');
          return res.redirect('/locations/' + location.slug);
        } else {
          console.error(err);
          // error occured
          res.redirect('locations/new', {
            title: 'New Location',
            location: location,
            errors: utils.errors(err.errors || err)
          });
        }
      });
    }
  })
}


exports.index = function (req, res, next) {
  Location.find().sort('created').limit(10).exec(function (err, locations) {
    if (err) return next(err);
    res.status(200).render('locations/index.jade', {
      title: "Nock Locations",
      locations: locations
    });
  });
}


exports.show = function (req, res, next) {

  var location = req.location;

  res.render('locations/show.jade', {
    title: location.name,
    location: location
    /* comments: promise */
  });
}


exports.edit =  function (req, res) {
  res.render('locations/edit.jade', {
    location: req.location,
    errors: [],
    title: "Edit location"
  });
}


exports.update = function (req, res, next) {

  var location = req.location;

  location.set(req.body);
  location.slug = utils.convertToSlug(req.body.name);

  location.uploadAndSave(req.files.image, function(err) {
    if (!err) {
      console.log('location update successful');
      return res.redirect('/locations/' + location.slug);
    } else {
      console.error('location update error', err);
      return res.render('locations/edit', {
        title: 'Edit Challenge',
        location: location,
        errors: err.errors
      });
    }
  });
}



exports.destroy = function (req, res, next) {
  var location = req.location;

  // validate logged in user authored this location
  if (location.author != req.session.user) {
    return res.send(403);
  }

  location.remove(function (err) {
    if (err) return next(err);

    // TODO display a confirmation msg to user
    res.redirect('/');
  });

}



// API

exports.apiIndex = function (req, res, next) {
  var options = {};
  Location.list(options, function (err, locations) {
    if (err) return next(err);
    res.status(200).json({
      locations: locations
    });
  });
}


exports.apiShow = function (req, res, next) {

  var location = req.location;

  if (!location) {
    return res,status(404).json({ "error" : "not found"})
  } else {
    return res.status(200).json({
      location: location
    });
  }
}

/**
 * Adds a challenge to a location
 * Also adds the location reference back to the challenge to keep things in sync.
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.apiAddChallenge = function (req, res, next) {

  var location = req.location;
  var challengeId = req.query.challenge;

  console.dir(location);

  console.log("trying to add challenge " + challengeId);

  if (!location) {
    return res,status(404).json({ "error" : "not found"})
  } else {

    // find challenge by passed in ID
    Challenge.findOne({'_id': challengeId}, function (err, challenge) {
      if (err) {
        next(new Error(err));
      } else {
        if (challenge) {
          // add location to challenge
          challenge.locations.push(location);
          challenge.save(function (err, doc) {
            if (err) throw err;
            console.info("location added to challenge, proceeding");
          });
          // add challenge to location
          location.challenges.push(challenge);
          location.save(function (err, doc) {
            if (err) throw err;
            return res.status(200).json({
              'success': 'Challenge added'
            });
          });
        }
        else {
          return res.status(400).json({
            'error': 'bad request - challenge not found.'
          });
        }

      }

    });
  }
}



/**
 * Matches Foursquare Locations to Nock Locations by comparing FourSquare IDs
 */
exports.matchFourSquareIds = function (req, res, next) {
  console.log("incoming match request");
  console.dir(req);
  console.dir(req.body);

  var fourSquareIds = req.body.ids;

  Location.find({
      'fourSquareId': { $in: fourSquareIds }
  }, function(err, matchingLocations){
      console.log('I found the following matches: ');
      console.dir(matchingLocations);
      res.json(matchingLocations);
  });
}



