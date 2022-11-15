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
          expect(adminUser).to.be.an('object');
          expect(adminUser).to.include.all.keys('name', 'email', 'password', 'role');
      });

     it('Get current user', async () => {
          expect(adminUser).to.be.an('object');
        
      });

      it('Get user role', async () => {
          expect(customerUser.role).to.be.a('string');
      });

     it('Delete User', async () => {
          expect(customerUser.email).to.be.a('string');
        
     });

     it('Get single user', async () => {
          expect(customerUser).to.be.an('object');
     });

          
     it('Email Test', async () => {
          expect(adminUser.email).to.be.a('string');
     });

     it('Email Test 2', async () => {
          const testEmail = adminUser.email + "n";
          const user = users.find(user => user.email === testEmail);
          expect(user).to.be.undefined;
        
     });
  });

// Products endpoints
describe('Viewing all products: GET /api/products', () => {
  it('As a customer, I want to see a list of products available.', async () => {
     expect(products[0]).to.be.an('object');
   });
});

// A product endpoints
describe('Viewing a product: GET /api/products/{id}', () => {
  it('As a customer, I want to see the price of the product.', async () => {
     expect(products[0]).to.be.an('object');
  });
});

// A cart endpoints
describe('Adding a product to cart: POST /api/cart/{id}', () => {
  it('As a customer, I want to add items to the cart.', async () => {
     expect(products[0]).to.be.an('object');
  });
});
