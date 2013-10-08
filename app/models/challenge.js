/*
 * DB Schema for Challenges
 */


var mongoose = require('mongoose');
var createdDate = require('../helpers/plugins/createdDate');
var Imager = require('imager');
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];
var imagerConfig = require(config.root + '/config/imager.js');

var Schema = mongoose.Schema;

var ChallengeSchema = new Schema({
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
  image: {
    cdnUri: String,
    files: []
  },
  meta: {
    votes: Number,
    favs:  Number
  }
});

// add created date property
ChallengeSchema.plugin(createdDate);

/**
 * Pre-remove hook - delete images from S3 when removing record from db
 */

 ChallengeSchema.pre('remove', function (next) {
  var imager = new Imager(imagerConfig, 'S3');
  var files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err);
  }, 'challenge');

  next();
});



/**
 *  Methods
 */

 ChallengeSchema.methods = {

  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (images, cb) {
    if (!images || !images.length) return this.save(cb)

    var imager = new Imager(imagerConfig, 'S3')
    var self = this

    imager.upload(images, function (err, cdnUri, files) {
      if (err) {
        console.log("error uploading images");
        return cb(err);
      }
      if (files.length) {
        self.image = { cdnUri : cdnUri, files : files }
      }
      self.save(cb)
    }, 'challenge')
  }

}



var Challenge = mongoose.model('Challenge', ChallengeSchema);


// CREATE HOOKS afterInsert, afterRemove, afterComplete etc.

module.exports = Challenge;