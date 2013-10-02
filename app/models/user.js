/*
 * DB Schema for User
 */

var mongoose = require('mongoose');
var createdDate = require('../helpers/plugins/createdDate');
var validateEmail = require ('../helpers/validate/email');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id:      {type: String, lowercase: true, trim: true },  // use email for _id
  username: {type: String, required: true},
  points:   {type: Number, required: true, default: 0},
  date:     {type: Date, default: Date.now},
  salt:     {type: String, required: true},
  hash:     {type: String, required: true},
  location: Array,
  provider: {type: String, required: true, default: "email"}
});


// edit method on model level
userSchema.statics.updateLocation = function (req, callback) {

  if (!req.session.user) {
    res.status(401).send("forbidden");
  }

  // validate current user authored this blogpost
  var query = { _id: req.session.user };

  var update = {};
  update.location = req.param('location');

  this.update(query, update, function (err, numAffected) {
    if (err) return callback(err);

    if (0 === numAffected) {
      return callback(new Error('no post to modify'));
    }

    callback();
  })
}



module.exports = mongoose.model('User', userSchema);