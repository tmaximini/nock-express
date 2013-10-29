/*
 * DB Schema for Locations
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Imager = require('imager');
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];
var imagerConfig = require(config.root + '/config/imager.js');

var LocationSchema = new Schema({
  _id:    String,
  slug: {type: String, required: true},
  fourSquareId: String,
  name:  {type: String, required: true},
  adress: String,
  body:   String,
  images: Array,
  //comments: [{ body: String, date: Date }],
  location: {
    lang: Number,
    lat: Number
  },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});

/**
 * Pre-remove hook - delete images from S3 when removing record from db
 */

 LocationSchema.pre('remove', function (next) {
  var imager = new Imager(imagerConfig, 'S3');
  var files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err);
  }, 'location');

  next();
});



/**
 *  Methods
 */

  LocationSchema.methods = {

  /**
   * Save location and upload image
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
    }, 'location')
  }

}



module.exports = mongoose.model('Location', LocationSchema);