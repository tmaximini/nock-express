"use strict";

var should = require('chai').should();
var request = require('supertest');
var mongoose = require('mongoose');

var helper    = require('./helpers');

var app       = require('../app');
var agent     = request.agent(app);

var User      = mongoose.model('User');
var Location = mongoose.model('Location');

var utils     = require('../lib/utils');

var testLocation = null;

describe('Locations', function () {

  before(function (done) {

    var ident = helper.getRandomString();
    // create a location
    testLocation = new Location({
      name: ident,
      body: 'awesome thingy',
      fourSquareId: "12345",
      slug: ident
    });
    console.log('saving location');
    testLocation.save(done);
  });


  describe('The API', function () {
    // get locations
    describe('GET /api/locations', function() {
      it('returns locations as JSON', function(done) {
        agent
        .get('/api/locations')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('locations').and.be.instanceof(Array);
          done();
        });
      });
    });

    // get location
    describe('GET /api/locations/:id', function() {
      it('returns one location record as JSON', function(done) {
        agent
        .get('/api/locations/' + testLocation.slug)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Object);
          done();
        });
      });
    });

  }); // END API


  describe("The Web Interface", function () {

    describe('GET /locations', function() {
      it('displays a list of locations', function(done) {
        agent
        .get('/locations')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(function(err, res) {
          if (err) return done(err);
          //console.dir(res);
          done();
        });
      });
    });


    describe('GET /locations/:id', function() {
      it('should display a single location', function(done) {
        agent
        .get('/locations/' + testLocation.slug)
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
      });
    });


    // create location
    describe('POST /locations', function() {

      var locationId = helper.getRandomString();

      it('creates a new location record', function(done) {
        agent
        .post('/locations')
        .field('name', locationId)
        .field('body', 'lorem ipsum')
        .field('points', '500')
        .expect(302)
        .end(function(err, res) {
          should.not.exist(err);

          done();
        });
      });

      it('saves the record to the database', function(done) {
        Location.findOne({ 'slug': utils.convertToSlug(locationId) }, function (err, doc) {
          should.not.exist(err);
          doc.should.be.an.instanceOf(Location);
          doc.name.should.equal(locationId);
          doc.body.should.equal('lorem ipsum');
          done();
        });
      });

      it('does not allow the same location title twice', function(done) {
        agent
        .post('/locations')
        .field('name', locationId)
        .field('body', 'lorem ipsum')
        .field('points', '500')
        .expect(400)
        .expect(/already exists/)
        .end(done)
      });

    });

    describe('PUT /locations/:id', function() {

      it('location records can be edited', function(done) {
        agent
        .put('/locations/' + testLocation.slug)
        .field('name', 'pi pa po')
        .field('body', 'lalalala')
        .field('image[]', '')
        .expect(302)
        .expect(/pi-pa-po/)
        .end(done);
      });

    });

  }); // END Web Interface


  // delete all db records from test
  after(function (done) {
    helper.clearDb(done);
  });

});
