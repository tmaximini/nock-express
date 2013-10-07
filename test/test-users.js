

var should = require('chai').should();
var request = require('supertest');
var mongoose = require('mongoose');

var helper = require('./helpers');

var app = require('../app');
var agent = request.agent(app);

var User = mongoose.model('User');
var Challenge = mongoose.model('Challenge');


var testUser = null;

describe('Users', function () {

  before(function (done) {
    // create a user
    testUser = new User({
      _id: '1234',
      email: 'foobar@example.com',
      name: 'Foo bar',
      username: 'foobar',
      password: 'foobar',
      salt:     '1234567890987654',
      hash:     helper.hash('foobar', '1234567890987654'),
      provider: "Facebook"
    });
    testUser.save(done);
  });


  describe('The API', function () {

    // get users
    describe('GET /api/users', function() {
      it('returns users as JSON', function(done) {
        agent
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('users').and.be.instanceof(Array);
          done();
        });
      });
    });

    // get user
    describe('GET /api/users/:id', function() {
      it('returns one user record as JSON', function(done) {
        agent
        .get('/api/users/' + testUser._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Object);
          res.body.username.should.equal(testUser.username);
          done();
        });
      });
    });

    // get user
    describe('POST /api/users/login', function() {
      it('handles login when password correct', function(done) {
        agent
        .post('/api/users/login')
        .field('username', '1234')
        .field('password', 'foobar')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Object);
          res.body.username.should.equal(testUser.username);
          done();
        });
      });
      it('throws error when password is wrong', function(done) {
        agent
        .post('/api/users/login')
        .field('username', '1234')
        .field('password', 'wrong')
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(/error/)
        .end(done);
      });
    });

    // new users
    describe('POST /api/users', function() {

      // random integer as string between 10000 and 99999
      var userId = (Math.floor(Math.random() * (99999 - 10000 + 1) + 10000)).toString();

      it('creates a new user record', function(done) {
        agent
        .post('/api/users')
        .field('username', userId)
        .field('password', 'secret')
        .field('fbUserName', 'Klaus Kleber')
        .expect(302)
        .expect(/Moved Temporarily/)
        .end(done);
      });

      it('saves the record to the database', function(done) {
        User.findById(userId, function (err, doc) {
          should.not.exist(err);
          doc.should.be.an.instanceOf(User);
          doc.username.should.equal('Klaus Kleber');
          doc.provider.should.equal('Facebook');
          done();
        });
      });

      it('does not allow the same username twice', function(done) {
        agent
        .post('/api/users')
        .field('username', userId)
        .field('password', 'secret')
        .field('fbUserName', 'Klaus Baus')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(/error/)
        .end(done);
      });

    });

  });



  after(function (done) {
    helper.clearDb(done);
  });

});
