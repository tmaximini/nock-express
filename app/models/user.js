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
  salt:     {type: String, required: true, default: ''},
  hash:     {type: String, required: true, default: ''},
  location: Array,
  provider: {type: String, required: true, default: "email"}
});


// edit method on model level
userSchema.statics.edit = function (req, callback) {

  if (!req.session.user) {
    res.status(401).send("forbidden");
  }

  // validate current user authored this blogpost
  var query = { _id: req.session.user };

  var update = {};
  if (req.param('points')) {
    var points = req.param('points');
    update = { $inc: { 'points': points.inc } };
  }
  if (req.param('location')) update.location = req.param('location');


  console.log("update to do: ", update);

  this.update(query, { $inc: { 'points': 100 } }, function (err, numAffected) {
    if (err) return callback(err);

    console.log("user updated");

    if (0 === numAffected) {
      return callback(new Error('no post to modify'));
    }

    callback();
  })
}



module.exports = mongoose.model('User', userSchema);