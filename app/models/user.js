/*
 * DB Schema for User
 */

var mongoose = require('mongoose');
var createdDate = require('../helpers/plugins/createdDate');
var validateEmail = require ('../helpers/validate/email');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id:    {type: String, lowercase: true, trim: true, validate: validateEmail},  // use email for _id
  name:   {type: String, required: true},
  points: {type: Number, required: true, default: 0},
  date:   {type: Date, default: Date.now},
  salt:   {type: String, required: true},
  hash:   {type: String, required: true}
});



module.exports = mongoose.model('User', userSchema);