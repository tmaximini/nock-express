
function StaticHandler (db) {
    "use strict";

    this.displayIndex = function(req, res, next) {

        // show index page
        res.render("index", {
          title: "Welcome to Nock"
        });
    }

}

module.exports = StaticHandler;
