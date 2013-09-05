
/* The UserHandler must be constructed with a connected db */
function UserHandler (db) {
    "use strict";

    var users = db.collection("users");

    this.displayUsers = function(req, res, next) {
        "use strict";

        users.find().sort('name', 1).limit(20).toArray(function (err, items) {

          if (err) {
            throw err;
          }

          // answer with JSON only atm

          res.json(items);

          console.dir(items);



        });
    }
}

module.exports = UserHandler;
