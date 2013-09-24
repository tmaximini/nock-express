/*
 * DB Schema for Locations
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
  _id:    String,
  name:  {type: String, required: true},
  body:   String,
  images: Array,
  //comments: [{ body: String, date: Date }],
  location: {
    lang: Number,
    lat: Number
  }
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});