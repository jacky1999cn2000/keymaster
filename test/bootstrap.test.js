var Sails = require('sails'),
sails;

before(function (done) {

  this.timeout(40000);

  Sails.lift({
    // configuration for testing purposes
    environment: 'development'
  }, function (err, server) {
    sails = server;
    if (err) return done(err);
    
    // here you can load fixtures, etc.
    done(err, sails);
  });

});

after(function (done) {
  // here you can clear fixtures, etc.
  Sails.lower(done);
});
