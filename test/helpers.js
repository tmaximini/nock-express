
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var async = require('async');
require ('../app/models');
var Challenge = mongoose.model('Challenge');
var Location = mongoose.model('Location');
var User = mongoose.model('User');
var crypto = require('crypto');



/**
 * Clear database
 *
 * @param {Function} done
 * @api public
 */

exports.clearDb = function (done) {
  async.parallel([
    function (cb) {
      Challenge.collection.remove(cb);
    },
    function (cb) {
      User.collection.remove(cb);
    },
    function (cb) {
      Location.collection.remove(cb);
    }
  ], done);
}


exports.hash = function (pass, salt) {
  var hash = crypto.createHash('sha512');
  hash.update(pass, 'utf8');
  hash.update(salt, 'utf8');
  return hash.digest('base64');
}