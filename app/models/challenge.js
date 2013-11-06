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

var Location = require('./location');

var Schema = mongoose.Schema;

var ChallengeSchema = new Schema({
  slug: {type: String, required: true}, // this is the SEO optimized title, lowercased, dashed
  title:  {type: String, required: true},
  body:   String,
  points: {type: Number, required: true, default: 0},
  //comments: [{ body: String, date: Date }],
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



// Duplicate the ID field.
ChallengeSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
ChallengeSchema.set('toJSON', {
    virtuals: true
});





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

  /**
   * List challenges
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (o, cb) {
    var options = o || {};
    var criteria = options.criteria || {}
    options.perPage = options.perPage || 200;
    options.page = options.page || 0;

    this.find(criteria)
      .select('id slug title body created points image meta')
      .populate('locations', 'name adress fourSquareId')
      .sort({'created': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },

  /**
   * Find challenge by id
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