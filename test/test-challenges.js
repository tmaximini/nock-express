

var should = require('chai').should();
var request = require('supertest');
var mongoose = require('mongoose');

var helper = require('./helpers');

var app = require('../app');
var agent = request.agent(app);

var User = mongoose.model('User');
var Challenge = mongoose.model('Challenge');

var utils = require('../lib/utils');


var testUser = null;

describe('Challenges', function () {

  before(function (done) {

    // create a user
    testChallenge = new Challenge({
      title: helper.getRandomString(),
      body: 'awesome thingy',
      date: new Date(),
      points: 500
    });
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
        .get('/api/challenges/' + testChallenge._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Object);
          res.body.title.should.equal(testChallenge.title);
          res.body.points.should.equal(testChallenge.points);
          done();
        });
      });
    });

  }); // END API


  describe("The Web Interface", function () {

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
        Challenge.findById(utils.convertToSlug(challengeId), function (err, doc) {
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

  }); // END Web Interface


  // delete all db records from test
  after(function (done) {
    helper.clearDb(done);
  });

});
