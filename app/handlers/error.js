// Error handling middleware

module.exports = function(app) {
    "use strict";

    // 404
    app.use(function (req, res, next) {
      res.status(404);

      if (req.accepts('html')) {
        return res.render('404', {title: "An error occured", errorMessage: "The page you requested was not found."});
      }

      if (req.accepts('json')) {
        return res.json({'error': 'Not found'});
      }

      // default response type
      res.type('txt')
      re.send("The page you requested was not found.");

    });

    // 500
    app.use(function (err, req, res, next) {
      console.error('error at %s\n', req.url, err);
      res.status(500).render('404', {title: "An error occured", errorMessage: "Opps, something went wrong"});
    })


}
