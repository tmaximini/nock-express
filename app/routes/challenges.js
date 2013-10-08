var loggedIn = require('../middleware/loggedIn');
var mongoose = require('mongoose')
var Challenge = mongoose.model('Challenge');



module.exports = function (app) {
  "use strict";

  function convertToSlug(text) {
      return text
          .toLowerCase()
          .replace(/ /g,'-')
          .replace(/[^\w-]+/g,'');
  }

  // create
  app.get("/challenges/new", loggedIn, function (req, res) {
    res.render('challenges/create.jade', {
      title: "Create Challenge",
      invalid: false,
      exists: false
    });
  });

  app.post("/challenges", loggedIn, function (req, res, next) {
    var body     = req.param('body');
    var title    = req.param('title');
    var points   = req.param('points');
    var location = req.param('location');
    var user     = req.session.user;

    Challenge.create({
        _id: convertToSlug(title),
        body: body,
        title: title,
        points: points,
        author: user,
        location: location
     }, function (err, challenge) {
       if (err) return next(err);
       res.redirect('/challenges/' + challenge.id);
    });


  });


  // read
  app.get("/challenges", function (req, res, next) {
    Challenge.find().sort('created').limit(10).exec(function (err, challenges) {
      if (err) return next(err);
      res.render('challenges/index.jade', {
        title: "Nock Challenges",
        challenges: challenges
      });
    });
  });

  app.get("/challenges/:id", function (req, res, next) {
    var id = req.param('id');

    //var promise = Challenge.findComments(id)
    //                      .sort('created')
    //                      .select('-_id') // exclude the _id
    //                      .exec();

    var query = Challenge.findById(id).populate('author');
    query.exec(function (err, challenge) {
      if (err) return next(err);

      if (!challenge) return next(); // 404

      res.render('challenges/show.jade', {
        title: challenge.title,
        challenge: challenge
        /* comments: promise */
      });
    });
  });




  // update
  app.get("/challenges/edit/:id", loggedIn, function (req, res, next) {
    res.render('challenges/create.jade', {
      challenge: Challenge.findById(req.param('id'))
    });
  });

  app.post("/challenges/edit/:id", loggedIn, function (req, res, next) {
    Challenge.edit(req, function (err) {
      if (err) return next(err);
      res.redirect("/challenges/" + req.param('id'));
    });
  });

  // delete
  app.get("/challenges/remove/:id", loggedIn, function (req, res, next) {
    var id = req.param('id');

    Challenge.findOne({ _id: id }, function (err, challenge) {
      if (err) return next(err);

      // validate logged in user authored this challenge
      if (challenge.author != req.session.user) {
        return res.send(403);
      }

      challenge.remove(function (err) {
        if (err) return next(err);

        // TODO display a confirmation msg to user
        res.redirect('/');
      });
    });
  });

}
