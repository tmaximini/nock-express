/*
 * DB Schema for Challenges
 */


var mongoose = require('mongoose');
var createdDate = require('../helpers/plugins/createdDate');

var Schema = mongoose.Schema;

var challengeSchema = new Schema({
  _id:    String,
  title:  {type: String, required: true},
  body:   String,
  points: {type: Number, required: true, default: 0},
  images: Array,
  //comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  author: { type: String, ref: 'User' },
  location: { type: String, ref: 'Location' },
  meta: {
    votes: Number,
    favs:  Number
  }
});

// add created date property
challengeSchema.plugin(createdDate);

var Challenge = mongoose.model('Challenge', challengeSchema);


// CREATE HOOKS afterInsert, afterRemove, afterComplete etc.

module.exports = Challenge;