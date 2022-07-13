//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Account', () => {
  beforeEach((done) => {
    //Before each test we empty the database in your case
    done();
  });

  /*
   * Test the login
   */
  describe('/POST login', () => {
    it('it should POST a login success', (done) => {
      let user = {
        email: 'hoanganh36.work@gmail.com',
        password: 'Ha@123456',
      };
      chai
        .request(server)
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data').property('token');
          res.body.should.have.property('status').eql('success');
          done();
        });
    });
    it('it should not POST when email is incorrect', (done) => {
      let userEmailIncorrect = {
        email: 'skyahq131@gmail.com',
        password: 'hoanganh',
      };
      chai
        .request(server)
        .post('/api/auth/login')
        .send(userEmailIncorrect)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('error');
          res.body.should.have.property('message').eql('Email or password is incorrect');
          done();
        });
    });
    it('it should not POST when password is incorrect', (done) => {
      let userPasswordIncorrect = {
        email: 'hoanganh36.work@gmail.com',
        password: 'hoanganh1',
      };
      chai
        .request(server)
        .post('/api/auth/login')
        .send(userPasswordIncorrect)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('error');
          res.body.should.have.property('message').eql('Email or password is incorrect');
          done();
        });
    });
  });

  /*
   * Test the signup
   */
  describe('/POST signup', () => {
    it('it should POST a signup success', (done) => {
      let user = {
        username: 'test',
        fullname: 'test',
        email: 'test@gmail.com',
        password: 'Ha@123456',
      };
      chai
        .request(server)
        .post('/api/auth/signup')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data').property('token');
          res.body.should.have.property('status').eql('success');
          done();
        });
    });
    it('it should not POST when username or fullname is incorrect', (done) => {
      let userNameOrFullNameIncorrect = {
        email: 'test@gmail.com',
        password: 'Ha@123456',
      };
      chai
        .request(server)
        .post('/api/auth/signup')
        .send(userNameOrFullNameIncorrect)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('error');
          res.body.should.have.property('message').eql('Enter a valid username.');
          done();
        });
    });
  });
});
