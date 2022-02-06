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
  describe('/GET user', () => {});
});
