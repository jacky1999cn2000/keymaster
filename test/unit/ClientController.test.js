'use strict';

var request = require('supertest');

describe('ClientController', function() {

  before(function(){

  });

  describe('#findOne', function(){
    it('should pass', function(done){
      request(sails.hooks.http.app)
          .get('/client/1234')
          .expect(400, done);
    });
  });
});
