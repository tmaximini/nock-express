
/* The UserHandler must be constructed with a connected db */
function UserHandler (db) {
    "use strict";

    var users = db.collection("users");

    this.displayUsers = function(req, res, next) {

        users.find().sort('name', 1).limit(20).toArray(function (err, items) {

          if (err) {
            throw err;
          }

          // answer with JSON only atm

          res.json(items);

          console.dir(items);



        });
    }

    this.getUserByName = function (req, res, next) {

        var name = req.params.name;

        users.findOne({ "name": name}, function (err, user) {
          if (err) {
            console.status(404).send('Not found');
          }

          // answer with JSON only atm

          res.json(user);

        });

    }
}

module.exports = UserHandler;
