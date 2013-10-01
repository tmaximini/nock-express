var mongoose = require('mongoose');
var User = mongoose.model('User');

/* The UserHandler must be constructed with a connected db */
function UserHandler (db) {
    "use strict";

    // users collection
    var users = db.collection("users");

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
      // extract name from params
      var username = req.body.username;
      var password = req.body.password;

      console.dir(req.body);

      console.log("login user " + username + " with password " + password);

      users.findOne({ "username": username}, function (err, user) {
        if (err) {
          console.log("Error in login....");
          next(new Error("Error in login!"));
        }

        if(!user) {
          res.status(401).send({"error":"User not found"});
        }
        // TODO handle password


        // answer with JSON only atm
        res.json(user);

      });
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
    this.newUser = function (req, res, next) {

      var name  = req.body.userName;
      var email = req.body.userEmail;
      var age   = req.body.userAge;
      var city  = req.body.userCity;

      // return error TODO
      if (!name) {
        console.log('Needs username');
        next(new Error("needs a username"));
      }
      else {
        var user = {
          "name": name,
          "email": email,
          "age": age,
          "city": city
        }
        // insert db record
        users.insert(user, function (err, doc) {
          if (err) {
            res.status(500).send('Error inserting in database');
            console.log(err);
          }
          res.json(doc);
        });
      }
    }

}

module.exports = UserHandler;
