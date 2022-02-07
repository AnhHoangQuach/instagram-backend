//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('User', () => {
  beforeEach((done) => {
    //Before each test we empty the database in your case
    done();
  });

  /*
   * Test the user
   */
  describe('/GET/:userId user', () => {
    it('it should GET a user by the given id', (done) => {
      let userId = '61d9d06b3b4b09676ac99de0';
      chai
        .request(server)
        .get('/api/user/' + userId)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.user.should.have.property('email');
          res.body.data.user.should.have.property('username');
          done();
        });
    });
  });
});
