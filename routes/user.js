
/* The UserHandler must be constructed with a connected db */
function UserHandler (db) {
    "use strict";

    // users collection
    var users = db.collection("users");

    this.displayUsers = function(req, res, next) {
        // limit to 20 users for now
        users.find().sort('name', 1).limit(20).toArray(function (err, items) {
          if (err) {
            next(err);
          }
          // answer with JSON only atm
          res.render("users/index", {
            title: "User Listing",
            users: items
          });
        });
    }

    this.displayUsersJSON = function(req, res, next) {
        // limit to 20 users for now
        users.find().sort('name', 1).limit(20).toArray(function (err, items) {
          if (err) {
            next(err);
          }
          // answer with JSON only atm
          res.json(items);
          console.dir(items);
        });
    }

    this.getUserByName = function (req, res, next) {
        // extract name from params
        var name = req.params.name;

        console.log("get user " + name + " by name");

        users.findOne({ "name": name}, function (err, user) {
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
        var name = req.params.name;

        console.log("get user " + name + " by name");

        users.findOne({ "name": name}, function (err, user) {
          if (err || !user) {
            console.log("user not found! error....");
            next(new Error("User not found!"));
          }
          // answer with JSON only atm
          res.json(user);
        });
    }


    // this method adds a generic user object to mongodb
    // as we do not know yet which fields we will receive / use
    // exactly from different auth providers, such as facebook, twitter, google etc
    this.newGenericUser = function (req, res, next) {

        console.log("trying to create generic user...");

        console.dir(req.body);

        var userObject = req.body;

        //for (var key in userObject) {
        //  if (userObject.hasOwnProperty(key)) {
        //    console.log(key + " -> " + userObject[key]);
        //  }
        //}

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
