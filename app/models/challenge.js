/*
 * DB Schema for Challenges
 */


var mongoose = require('mongoose');
var createdDate = require('../helpers/plugins/createdDate');
var Imager = require('imager');
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];
var imagerConfig = require(config.root + '/config/imager.js');
var utils = require('../../lib/utils');

var Location = require('./Location');

var Schema = mongoose.Schema;

var ChallengeSchema = new Schema({
  slug: {type: String, required: true}, // this is the SEO optimized title, lowercased, dashed
  title:  {type: String, required: true},
  body:   String,
  points: {type: Number, required: true, default: 0},
  //comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  author: { type: Schema.ObjectId, ref: 'User' },
  locations: [{
    type: Schema.ObjectId,
    ref: 'Location'
  }],
  image: {
    cdnUri: String,
    files: []
  },
  meta: {
    votes: Number,
    favs:  Number
  },
  lastModified: { type: Date, default: Date.now },
  lastEditedBy: { type: Schema.ObjectId, ref: 'User' }
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
  * Statics
  */

ChallengeSchema.statics = {

  edit: function (req, callback) {
    // var author = req.session.user;
    var challenge = req.challenge;

    // validate current user authored this blogpost
    var query = { slug: challenge.slug };

    var update = {};
    update.title = req.param('title');
    update.body = req.param('body');
    update.points = req.param('points');
    update.location = req.param('location');
    update.slug = utils.convertToSlug(req.param('title'));

    this.update(query, update, function (err, numAffected) {
      if (err) return callback(err, null);

      if (0 === numAffected) {
        return callback(new Error('no challenge to modify'), null);
      }

      callback(null, '/challenges/' + update.slug);
    });
  },

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ slug : id })
      .populate('author', 'username email')
      .exec(cb)
  }

}

/**
 *  Methods
 */

ChallengeSchema.methods = {

  /**
   * Save challenge and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */
  uploadAndSave: function (images, cb) {
    if (!images || !images.length) return this.save(cb);

    var imager = new Imager(imagerConfig, 'S3');
    var self = this;

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
  },

  /**
   * adds a location reference to a challenge
   * @param  {String}   locationId _id of the location
   * @param  {Function} cb         callback(err)
   */
  connectToLocation: function (locationId, cb) {
    var self = this;
    var location = Location.findOne({ _id: locationId}, function (err, loc) {
      if (err) return cb(new Error(err));
      if (!loc) {
        return cb(new Error('location not found'));
      } else {
        self.locations.push(loc);
        return self.save(cb);
      }
    });

  }

}



var Challenge = mongoose.model('Challenge', ChallengeSchema);


// CREATE HOOKS afterInsert, afterRemove, afterComplete etc.

module.exports = Challenge;