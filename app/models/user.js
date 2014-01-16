/*
 * DB Schema for User
 */

var mongoose = require('mongoose');
var createdDate = require('../helpers/plugins/createdDate');
var validateEmail = require ('../helpers/validate/email');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id:      { type: String, lowercase: true, trim: true  },  // use email for _id
  username: { type: String, required: true },
  points:   { type: Number, required: true, default: 0 },
  date:     { type: Date, default: Date.now },
  salt:     { type: String, required: true, default: '' },
  hash:     { type: String, required: true, default: '' },
  location: { type: Array, required: true, default: [52.503466, 13.410959] }, // Moritzplatz
  email: String,
  provider: { type: String, required: true, default: "email" },
  admin: { type: Boolean, default: false },
});


// edit method on model level
userSchema.statics = {


  edit: function (req, callback) {

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

    this.update(query, update, function (err, numAffected) {
      if (err) return callback(err);

      console.log("user updated, numAffected: " + numAffected);

      if (0 === numAffected) {
        return callback(new Error('no post to modify'));
      }

      callback(null);
    })
  },

  load: function (id, cb) {
    this.findOne({ _id : id })
      .select({ 'salt':0, 'hash': 0, '__v':0, 'admin': 0 }) // omit fields
      .exec(cb);
  },

  // User Index Query
  list: function (options, cb) {

    if (!options || (typeof options !== 'object')) {
      options = {};
    }

    if (!options.sortBy) options.sortBy = 'username';
    if (!options.limit) options.limit = 20;

    this.find()
      .select({'salt':0, 'hash': 0, '__v':0}) // omit fields
      .sort(options.sortBy)
      .limit(options.limit)
      .exec(cb);
  }

}



module.exports = mongoose.model('User', userSchema);