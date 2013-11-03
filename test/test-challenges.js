"use strict";

var should = require('chai').should();
var request = require('supertest');
var mongoose = require('mongoose');

var helper    = require('./helpers');

var app       = require('../app');
var agent     = request.agent(app);

var User      = mongoose.model('User');
var Challenge = mongoose.model('Challenge');

var utils     = require('../lib/utils');

var testChallenge = null;

describe('Challenges', function () {

  before(function (done) {

    var ident = helper.getRandomString();
    // create a challenge
    testChallenge = new Challenge({
      title: ident,
      body: 'awesome thingy',
      points: 500,
      slug: ident
    });
    console.log('saving challenge');
    testChallenge.save(done);
  });


  describe('The API', function () {
    // get challenges
    describe('GET /api/challenges', function() {
      it('returns challenges as JSON', function(done) {
        agent
        .get('/api/challenges')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('challenges').and.be.instanceof(Array);
          done();
        });
      });
    });

    // get challenge
    describe('GET /api/challenges/:id', function() {
      it('returns one challenge record as JSON', function(done) {
        agent
        .get('/api/challenges/' + testChallenge.slug)
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

    describe('GET /challenges', function() {
      it('displays a list of challenges', function(done) {
        agent
        .get('/challenges')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(function(err, res) {
          if (err) return done(err);
          //console.dir(res);
          done();
        });
      });
    });


    describe('GET /challenges/:id', function() {
      it('should display a single challenge', function(done) {
        agent
        .get('/challenges/' + testChallenge.slug)
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
      });
    });


    // create challenge
    describe('POST /challenges', function() {

      var challengeId = helper.getRandomString();

      it('creates a new challenge record', function(done) {
        agent
        .post('/challenges')
        .field('title', challengeId)
        .field('body', 'lorem ipsum')
        .field('points', '500')
        .expect(302)
        .end(function(err, res) {
          should.not.exist(err);

          done();
        });
      });

      it('saves the record to the database', function(done) {
        Challenge.findOne({ 'slug': utils.convertToSlug(challengeId) }, function (err, doc) {
          should.not.exist(err);
          doc.should.be.an.instanceOf(Challenge);
          doc.title.should.equal(challengeId);
          doc.body.should.equal('lorem ipsum');
          done();
        });
      });

      it('does not allow the same challenge title twice', function(done) {
        agent
        .post('/challenges')
        .field('title', challengeId)
        .field('body', 'lorem ipsum')
        .field('points', '500')
        .expect(400)
        .expect(/already exists/)
        .end(done)
      });

    });

    describe('PUT /challenges/:id', function() {

      it('challenge records can be edited', function(done) {
        agent
        .put('/challenges/' + testChallenge.slug)
        .field('title', 'pi pa po')
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
