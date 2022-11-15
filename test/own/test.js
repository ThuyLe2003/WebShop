const chai = require('chai');
const expect = chai.expect;

const {
  registerUser,
  deleteUser
} = require('../../controllers/users');

const User = require('../../models/user');

// Get products (create copies for test isolation)
const products = require('../../products.json').map(product => ({ ...product }));

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));

const adminUser = { ...users.find(u => u.role === 'admin') };
const customerUser = { ...users.find(u => u.role === 'customer') };

describe('User endpoints', () => {
  let response;
     it('User should be an object', async () => {
          let single_user = await User.findOne({});
              single_user = JSON.parse(JSON.stringify(single_user));

          expect(single_user).to.be.an('object');
          expect(single_user).to.include.all.keys('_id', 'name', 'email', 'password', 'role');
      });

     it('Get current user', async () => {
          const testEmail = `test${adminUser.password}@email.com`;
          const userData = { ...adminUser, email: testEmail };
          await registerUser(response, userData);
          const createdUser = await User.findOne({ email: testEmail });
    
          expect(response.statusCode).to.equal(201);
          expect(response.getHeader('content-type')).to.equal('application/json');
          expect(response._isJSON()).to.be.true;
          expect(response._isEndCalled()).to.be.true;
          expect(createdUser).to.not.be.null;
          expect(createdUser).to.not.be.undefined;
          expect(createdUser).to.be.an('object');
        
      });

      it('Get user role', async () => {
          let single_user = await User.findOne({});
          single_user = JSON.parse(JSON.stringify(single_user));
          expect(single_user.role).to.be.a('string');
      });

     it('Delete User', async () => {
          const userId = currentUser.id.split('').reverse().join('');
          await deleteUser(response, userId, currentUser);
          expect(response.statusCode).to.equal(404);
          expect(response._isEndCalled()).to.be.true;
        
     });

     it('Get single user', async () => {
          let single_user = await User.findOne({});
          single_user = JSON.parse(JSON.stringify(single_user));
          expect(single_user).to.be.an('object');
     });

          
     it('Email Test', async () => {
          const testEmail = adminUser.email;
          const userData = { ...adminUser, email: testEmail };
          await registerUser(response, userData);

          expect(response.statusCode).to.equal(400);
          expect(response._isEndCalled()).to.be.true;
         
        
     });

     it('Password Test', async () => {
          const testEmail = `test${adminUser.password}@email.com`;
          const testPassword = adminUser.password.substr(0, 9);
          const userData = { ...adminUser, email: testEmail, password: testPassword };
          await registerUser(response, userData);
          const user = await User.findOne({ email: testEmail }).exec();

          expect(response.statusCode).to.equal(400);
          expect(response._isEndCalled()).to.be.true;
          expect(user).to.be.null;
        
     });
  });

// Products endpoints
describe('Viewing all products: GET /api/products', () => {
  it('As a customer, I want to see a list of products available.', async () => {
        throw 'Not implemented';
   });
});

// A product endpoints
describe('Viewing a product: GET /api/products/{id}', () => {
  it('As a customer, I want to see the price of the product.', async () => {
        throw 'Not implemented';
  });
});

// A cart endpoints
describe('Adding a product to cart: POST /api/cart/{id}', () => {
  it('As a customer, I want to add items to the cart.', async () => {
        throw 'Not implemented';
  });

  it('As a customer, I want to remove a product from the cart.', async () => {
        throw 'Not implemented';
  });
});
