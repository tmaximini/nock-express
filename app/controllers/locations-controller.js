var loggedIn = require('../../config/middleware/loggedIn');
var mongoose = require('mongoose');
var Location = mongoose.model('Location');
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

