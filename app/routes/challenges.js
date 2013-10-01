var loggedIn = require('../middleware/loggedIn');
var mongoose = require('mongoose')
var Challenge = mongoose.model('Challenge');

module.exports = function (app) {
  "use strict";

  // create
  app.get("/challenges/create", loggedIn, function (req, res) {
    res.render('challenges/create.jade');
  });

  app.post("/challenges/create", loggedIn, function (req, res, next) {
    var body = req.param('body');
    var title = req.param('title');
    var user = req.session.user;

    Challenge.create({
        body: body
      , title: title
      , points: points
      , author: user
     }, function (err, challenge) {
       if (err) return next(err);
       res.redirect('/challenges/' + challenge.id);
    });


  });


  // read
  app.get("/challenges", function (req, res, next) {
    var query = Challenge.find();
    res.render('challenges/index.jade', {
      title: "Nock Challenges",
      challenges: ["bla", "blubb"]
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

      res.render('challenges/show.jade', { challenge: challenge /*, comments: promise */ });
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
