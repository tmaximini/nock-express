// Error handling middleware

module.exports = function(app) {
    "use strict";

    // 404
    app.use(function (req, res, next) {
      res.status(404);

      if (req.accepts('html')) {
        return res.send('<h2>Sorry. I could not find that page.</h2>');
      }

      if (req.accepts('json')) {
        return res.json({'error': 'Not found'});
      }

      // default response type
      res.type('txt');
      res.send('Hmmm, could not find that one');

    });

    // 500
    app.use(function (err, req, res, next) {
      console.error('error at %s\n', req.url, err);
      res.send(500, "Opps, someting went wrong");
    })


}
