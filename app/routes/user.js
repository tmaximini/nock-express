var mongoose = require('mongoose');
var User = mongoose.model('User');

var cleanString = require('../helpers/cleanString');
var hash = require('../helpers/hash');
var crypto = require('crypto');

/* The UserHandler must be constructed with a connected db */
function UserHandler () {
    "use strict";


    this.displayUsers = function(req, res, next) {

        // limit to 20 users for now
        User.find().sort('username').limit(10).exec(function (err, users) {
          if (err) return next(err);

          res.render("users/index", {
            title: "User Listing",
            users: users
          });
        });
    }

    this.displayUsersJSON = function(req, res, next) {
        // limit to 20 users for now
        User.find().sort('username').limit(20).exec(function (err, users) {
          if (err) return next(err);
          res.json(users);
          console.dir(users);
        });
    }

    this.getUserByName = function (req, res, next) {
        // extract name from params
        var username = req.params.username;

        User.findOne({ "username": username}, function (err, user) {
          if (err || !user) {
            console.log("user not found! error....");
            next(new Error("User not found!"));
          }
          // answer with JSON only atm
          res.render("users/show", {
            title: "User Details",
            user: user
          });
        });
    }

    this.getUserByNameJSON = function (req, res, next) {
        // extract name from params
        var username = req.params.username;

        User.findOne({ "username": username}, function (err, user) {
          if (err || !user) {
            console.log("user not found! error....");
            next(new Error("User not found!"));
          }
          // answer with JSON only atm
          res.json(user);
        });
    }


    /*
     * handles user login
     * @param username
     * @param password
     */
    this.handleLogin = function (req, res, next) {
      // validate input
      var email = cleanString(req.param('email'));
      var pass = cleanString(req.param('pass'));
      if (!(email && pass)) {
        return invalid();
      }

      // user friendly
      email = email.toLowerCase();

      // query mongodb
      User.findById(email, function (err, user) {
        if (err) return next(err);

        if (!user) {
          return invalid();
        }

        // check pass
        if (user.hash != hash(pass, user.salt)) {
          return invalid();
        }

        req.session.isLoggedIn = true;
        req.session.user = email;
        res.redirect('/');
      });
      function invalid () {
        return res.render('users/login.jade', { invalid: true });
      }
    }

    this.logoutUser = function (req, res) {
      req.session.isLoggedIn = false;
      req.session.user = null;
      res.redirect('/');
    }


    this.updateUser = function (req, res, next) {
      // extract id from params
      var id = parseInt(req.params.id);

      var data = req.body;

      console.log("updating user " + id + " with data:");

      console.dir(data);

      users.findOne({id: id}, function (err, _usr) {
        if (err) {
          console.log("error updating user....");
          next(new Error("error updating user!"));
        }

        if(!_usr) {
          res.status(401).send({"error":"User not found"});
        }
        // TODO handle update in mongo

        if (data.location) {
          users.update(
            { 'id': id },
            { $set: { 'location': data.location }},
              function (err, user) {
                  if (err) next(err);
                  console.log("user updated")
                  res.json(user);
              }
            );
        }
      });
    }


    // this method adds a generic user object to mongodb
    // as we do not know yet which fields we will receive / use
    // exactly from different auth providers, such as facebook, twitter, google etc
    this.newGenericUser = function (req, res, next) {

        console.log("trying to create generic user...");

        console.dir(req.body);

        var userObject = req.body;

        // insert generic user in database
        users.insert(userObject, function (err, doc) {
          if (err) {
            res.status(500).send('Error inserting generic user in database');
            console.log(err);
          }
          res.json(doc);
        });

    }

    // this will be called to insert user from our html form, where
    // we know exactly which fields we use and we can validate the input correctly
    this.registerUser = function (req, res, next) {

    var email = cleanString(req.param('email'));
    var pass = cleanString(req.param('pass'));
    if (!(email && pass)) {
      return invalid();
    }

    User.findById(email, function (err, user) {
      if (err) return next(err);

      if (user) {
        return res.render('signup.jade', { exists: true });
      }

      crypto.randomBytes(16, function (err, bytes) {
        if (err) return next(err);

        var user = { _id: email };
        user.salt = bytes.toString('utf8');
        user.hash = hash(pass, user.salt);

        User.create(user, function (err, newUser) {
          if (err) {
            if (err instanceof mongoose.Error.ValidationError) {
              return invalid();
            }
            return next(err);
          }

          // user created successfully
          req.session.isLoggedIn = true;
          req.session.user = email;
          console.log('created user: %s', email);
          return res.redirect('/');
        });
      });
    });
  }
}

module.exports = UserHandler;
