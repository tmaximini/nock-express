var loggedIn = require('../../config/middleware/loggedIn');
var mongoose = require('mongoose')
var Challenge = mongoose.model('Challenge');
var utils = require('../../lib/utils');

"use strict";

exports.new = function (req, res, next) {
  res.render('challenges/new.jade', {
    title: "Create Challenge",
    challenge: new Challenge({}),
    errors: []
  });
  console.dir(res.locals);
}


exports.create = function (req, res, next) {
  var challenge = new Challenge(req.body);
  challenge.author = req.user;

  var challengeId = utils.convertToSlug(req.body.title);

  Challenge.findOne({ 'slug': challengeId }, function (err, doc) {
    if (err) return next(err);
    if (doc) {
      console.log("challenge already exists!");

      return res.status(400).render('challenges/new', {
        title: 'New Challenge',
        challenge: challenge,
        errors: ["Challenge with that name already exists"]
      });

    }
    else {
      challenge.slug = challengeId;
      challenge.uploadAndSave(req.files.image, function (err) {
        if (!err) {
          req.flash('success', 'Successfully created challenge!');
          console.log('Successfully created challenge!');
          return res.redirect('/challenges/' + challenge.slug);
        } else {
          // error occured
          res.redirect('challenges/new', {
            title: "New Challenge",
            challenge: challenge,
            errors: utils.errors(err.errors || err)
          });
        }
      });
    }
  })
}


exports.index = function (req, res, next) {
  Challenge.find().sort('created').limit(10).exec(function (err, challenges) {
    if (err) return next(err);
    res.status(200).render('challenges/index.jade', {
      title: "Nock Challenges",
      challenges: challenges
    });
  });
}


exports.show = function (req, res, next) {

  var challenge = req.challenge;

  if (!challenge) return next(); // 404

  res.render('challenges/show.jade', {
    title: challenge.title,
    challenge: challenge
    /* comments: promise */
  });
}


exports.edit =  function (req, res) {
  res.render('challenges/edit.jade', {
    challenge: req.challenge,
    errors: [],
    title: "Edit Challenge"
  });
}


exports.update = function (req, res, next) {

  var challenge = req.challenge;

  Challenge.findOne({ slug: challenge.slug }, function (err, doc) {

    doc.set(req.body);
    doc.slug = utils.convertToSlug(doc.title);

    console.dir(doc);

    doc.uploadAndSave(req.files.image, function(err) {
      if (!err) {
        console.log('update successful');
        return res.redirect('/challenges/' + doc.slug);
      } else {
        console.error('update error', err);
        return res.render('challenges/edit', {
          title: 'Edit Challenge',
          challenge: doc,
          errors: err.errors
        });
      }
    });
  });
}



exports.destroy = function (req, res, next) {

  var challenge = req.challenge;

  // validate logged in user authored this challenge
  if (challenge.author != req.session.user) {
    return res.send(403);
  }

  challenge.remove(function (err) {
    if (err) return next(err);

    // TODO display a confirmation msg to user
    res.redirect('/');
  });
}



// API

exports.apiIndex = function (req, res, next) {
    Challenge.find().sort('created').limit(100).exec(function (err, challenges) {
      if (err) return next(err);
      res.status(200).json({
        challenges: challenges
      });
    });
}


exports.apiShow = function (req, res, next) {

  var challenge = req.challenge;

  if (!challenge) {
      return res,status(404).json({ "error" : "not found"})
  } else {
    return res.status(200).json({
      challenge: challenge
    });
  }
}


