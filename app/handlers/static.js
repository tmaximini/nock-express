
function StaticHandler (db) {
    "use strict";

    this.displayIndex = function(req, res, next) {

        // show index page
        res.render("index", {
          title: "Welcome to Nock"
        });
    }

    this.displayWebsite = function(req, res, next) {
        // show website index page
        res.render("website/index", {
          title: "Welcome to Nock"
        });
    }

    this.displayProvider = function(req, res, next) {
        // show website/provider
        res.render("website/provider", {
          title: "Welcome to Nock"
        });
    }

    this.displayImprint = function(req, res, next) {
        // show website/imprint
        res.render("website/imprint", {
          title: "Welcome to Nock"
        });
    }

    this.displayContact = function(req, res, next) {
        // show website/imprint
        res.render("website/contact", {
          title: "Welcome to Nock"
        });
    }

    this.displayCompany = function(req, res, next) {
        // show website/imprint
        res.render("website/company", {
          title: "Welcome to Nock"
        });
    }

}

module.exports = StaticHandler;
