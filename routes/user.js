
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


          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(items));
          console.dir(items);
          res.end()
        });
    }
}

module.exports = UserHandler;
