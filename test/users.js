

var should = require('chai').should();
var supertest = require('supertest');


var settings = require('../config/config')['test'];

var api = supertest('http://localhost:' + settings.port);

describe('/api/users', function() {

  it('returns users as JSON', function(done) {
    api.get('/api/users')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.should.have.property('users').and.be.instanceof(Array);
      done();
    });
  });

});