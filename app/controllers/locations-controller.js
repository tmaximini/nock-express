var loggedIn = require('../../config/middleware/loggedIn');
var mongoose = require('mongoose')
var Location = mongoose.model('Location');
var utils = require('../../lib/utils');
var _ = require('underscore');

"use strict";

exports.new = function (req, res, next) {
  res.render('locations/new.jade', {
    title: "Create Location",
    location: new Location({}),
    errors: []
  });
  console.dir(res.locals);
}


exports.create = function (req, res, next) {

  console.dir(req.body);

  var location = new Location(req.body);

  var locationId = utils.convertToSlug(req.body.name);

  Location.findById(locationId, function (err, doc) {
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
      location._id = locationId;
      location.uploadAndSave(req.files.image, function (err) {
        if (!err) {
          req.flash('success', 'Successfully created location!');
          console.log('Successfully created location!');
          return res.redirect('/locations/' + location._id);
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
  var id = req.param('id');

  var query = Location.findById(id);
  query.exec(function (err, location) {
    if (err) return next(err);

    if (!location) return next(); // 404

    res.render('locations/show.jade', {
      title: location.name,
      location: location
      /* comments: promise */
    });
  });
}


exports.edit =  function (req, res) {
  res.render('locations/edit.jade', {
    location: Location.findById(req.param('id')),
    errors: [],
    title: "Edit location"
  });
}


exports.update = function (req, res, next) {
  location.edit(req, function (err) {
    if (err) return next(err);
    res.redirect("/locations/" + req.param('id'));
  });
}



exports.destroy = function (req, res, next) {
  var id = req.param('id');

  Location.findOne({ _id: id }, function (err, location) {
    if (err) return next(err);

    // validate logged in user authored this location
    if (location.author != req.session.user) {
      return res.send(403);
    }

    location.remove(function (err) {
      if (err) return next(err);

      // TODO display a confirmation msg to user
      res.redirect('/');
    });
  });
}



// API

exports.apiIndex = function (req, res, next) {
    Location.find().sort('created').limit(100).exec(function (err, locations) {
      if (err) return next(err);
      res.status(200).json({
        locations: locations
      });
    });
}


exports.apiShow = function (req, res, next) {
  var id = req.param('id');

  var query = Location.findById(id);
  query.exec(function (err, location) {
    if (err) return next(err);
    if (!location) {
      return res,status(404).json({ "error" : "not found"})
   } else {
      return res.status(200).json({
        location: location
      });
   }
  });
}

/**
 * Matches Foursquare Locations to Nock Locations by comparing FourSquare IDs
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.matchFourSquareIds = function (req, res, next) {
  console.log("incoming match request");
  console.dir(req);
  console.dir(req.body);

  var fourSquareIds = req.body.ids;

/* corrected 'foursquareId'; it was '_id'; working now, getting OBJECT: (
        {
        "__v" = 0;
        "_id" = "a-place";
        adress = "";
        body = "";
        fourSquareId = 4cb607ca52edb1f79fc16bfe;
        images =         (
        );
        name = "A place";
    },
        {
        "__v" = 0;
        "_id" = "another-place";
        adress = "";
        body = "";
        fourSquareId = 4de4b8ac18385df2b059fa0a;
        images =         (
        );
        name = "Another place";
    } 
      is __v for hidden value ?
    feel free to delete this comment COBRA !!! */

  Location.find({
      'fourSquareId': { $in: fourSquareIds }
  }, function(err, matchingLocations){
      console.log('I found the following matches: ');
      console.dir(matchingLocations);
      res.json(matchingLocations);
  });


}

