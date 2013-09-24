/*
 * DB Schema for Challenges
 */


var mongoose = require('mongoose');
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
  meta: {
    votes: Number,
    favs:  Number
  }
});