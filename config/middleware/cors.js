module.exports = function cors(options) {

    var opts = options || {};

    options.allowedDomains = options.allowedDomains || [];

    return function(req, res, next) {
      res.header('Access-Control-Allow-Origin', options.allowedDomains);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    };

  }